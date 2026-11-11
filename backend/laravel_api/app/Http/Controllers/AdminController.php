<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    private const TZ = 'Asia/Manila';

    private function txnQuery()
    {
        return DB::table('wallet_transaction as t')
            ->leftJoin('wallet_wallet as sw', 'sw.id', '=', 't.sender_id')
            ->leftJoin('auth_user as su', 'su.id', '=', 'sw.user_id')
            ->leftJoin('wallet_wallet as rw', 'rw.id', '=', 't.receiver_id')
            ->leftJoin('auth_user as ru', 'ru.id', '=', 'rw.user_id')
            ->leftJoin('wallet_biller as b', 'b.id', '=', 't.biller_id')
            ->select([
                't.reference', 't.type', 't.amount', 't.fee', 't.note', 't.created_at',
                DB::raw("trim(concat(su.first_name, ' ', su.last_name)) as sender"),
                DB::raw("trim(concat(ru.first_name, ' ', ru.last_name)) as receiver"),
                'b.name as biller',
            ])
            ->orderByDesc('t.created_at');
    }

    private function filteredTxns(Request $request)
    {
        $f = $request->validate([
            'type' => ['nullable', 'in:CASH_IN,SEND,BILL_PAYMENT'],
            'q' => ['nullable', 'string', 'max:50'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
        ]);

        return $this->txnQuery()
            ->when($f['type'] ?? null, fn ($q, $v) => $q->where('t.type', $v))
            ->when($f['q'] ?? null, fn ($q, $v) => $q->where('t.reference', 'ilike', "%{$v}%"))
            ->when($f['from'] ?? null, fn ($q, $v) => $q->where(
                't.created_at', '>=', Carbon::parse($v, self::TZ)->startOfDay()->toIso8601String()))
            ->when($f['to'] ?? null, fn ($q, $v) => $q->where(
                't.created_at', '<=', Carbon::parse($v, self::TZ)->endOfDay()->toIso8601String()));
    }

    public function dashboard()
    {
        $today = Carbon::today(self::TZ);
        $weekStart = $today->copy()->subDays(6);
        $todayTxn = DB::table('wallet_transaction')->where('created_at', '>=', $today->toIso8601String());

        $stats = [
            'users' => DB::table('wallet_profile')->count(),
            'balance' => DB::table('wallet_wallet')->sum('balance'),
            'txn_today' => (clone $todayTxn)->count(),
            'volume_today' => (clone $todayTxn)->sum('amount'),
        ];

        $byType = DB::table('wallet_transaction')
            ->select('type', DB::raw('count(*) as n'), DB::raw('sum(amount) as total'))
            ->groupBy('type')->get();

        $rows = DB::table('wallet_transaction')
            ->selectRaw("(created_at AT TIME ZONE 'Asia/Manila')::date as day, count(*) as n, sum(amount) as volume")
            ->where('created_at', '>=', $weekStart->toIso8601String())
            ->groupBy('day')->get()->keyBy('day');

        $days = collect(range(0, 6))->map(function ($i) use ($weekStart, $rows) {
            $d = $weekStart->copy()->addDays($i);
            $r = $rows->get($d->toDateString());
            return ['label' => $d->format('D'), 'n' => $r->n ?? 0, 'volume' => (float) ($r->volume ?? 0)];
        });
        $max = max(1, $days->max('volume'));

        $recent = $this->txnQuery()->limit(8)->get();

        return view('dashboard', compact('stats', 'byType', 'days', 'max', 'recent'));
    }

    public function users(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $users = DB::table('auth_user as u')
            ->join('wallet_profile as p', 'p.user_id', '=', 'u.id')
            ->join('wallet_wallet as w', 'w.user_id', '=', 'u.id')
            ->select('u.id', 'u.first_name', 'u.last_name', 'u.is_active', 'u.date_joined',
                'p.mobile_number', 'w.balance')
            ->when($q !== '', fn ($query) => $query->where(function ($w) use ($q) {
                $w->where('p.mobile_number', 'ilike', "%{$q}%")
                    ->orWhere('u.first_name', 'ilike', "%{$q}%")
                    ->orWhere('u.last_name', 'ilike', "%{$q}%");
            }))
            ->orderByDesc('u.date_joined')
            ->paginate(15)->withQueryString();

        return view('users', ['rows' => $users, 'q' => $q]);
    }

    public function transactions(Request $request)
    {
        $txns = $this->filteredTxns($request)->paginate(20)->withQueryString();
        return view('transactions', ['rows' => $txns]);
    }

    public function export(Request $request)
    {
        $query = $this->filteredTxns($request)->limit(5000);
        AuditLog::record('export_csv', http_build_query($request->only(['type', 'q', 'from', 'to'])));

        // Prevent CSV/formula injection from user-supplied text.
        $safe = fn ($v) => is_string($v) && preg_match('/^[=+\-@\t\r]/', $v) ? "'" . $v : $v;

        return response()->streamDownload(function () use ($query, $safe) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Reference', 'Type', 'Sender', 'Receiver', 'Biller', 'Amount', 'Fee', 'Note', 'Date (Manila)']);
            foreach ($query->cursor() as $r) {
                fputcsv($out, [
                    $r->reference, $r->type, $safe($r->sender), $safe($r->receiver), $safe($r->biller),
                    $r->amount, $r->fee, $safe($r->note),
                    Carbon::parse($r->created_at)->timezone(self::TZ)->format('Y-m-d H:i:s'),
                ]);
            }
            fclose($out);
        }, 'transactions-' . now()->format('Ymd-His') . '.csv', ['Content-Type' => 'text/csv']);
    }

    public function audit()
    {
        $logs = AuditLog::with('user')->latest('id')->paginate(20);
        return view('audit', ['rows' => $logs]);
    }
}