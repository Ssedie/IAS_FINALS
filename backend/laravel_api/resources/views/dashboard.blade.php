@extends('layout')
@section('title', 'Dashboard')
@section('content')
<h1>Dashboard</h1>
<div class="grid">
  <div class="card"><div class="k">Registered users</div><div class="v">{{ number_format($stats['users']) }}</div></div>
  <div class="card"><div class="k">Total wallet balances</div><div class="v">₱{{ number_format($stats['balance'], 2) }}</div></div>
  <div class="card"><div class="k">Transactions today</div><div class="v">{{ number_format($stats['txn_today']) }}</div></div>
  <div class="card"><div class="k">Volume today</div><div class="v">₱{{ number_format($stats['volume_today'], 2) }}</div></div>
</div>

<div class="card">
  <div class="k" style="margin-bottom:12px">Daily volume, last 7 days</div>
  <div class="bars">
    @foreach ($days as $d)
      <div class="bar">
        <i style="height:{{ max(2, round($d['volume'] / $max * 110)) }}px"></i>
        {{ $d['label'] }}<br>₱{{ number_format($d['volume']) }}
      </div>
    @endforeach
  </div>
</div>

<div class="card">
  <div class="k" style="margin-bottom:8px">By type (all time)</div>
  <div class="wrap"><table>
    <tr><th>Type</th><th class="n">Count</th><th class="n">Total</th></tr>
    @forelse ($byType as $t)
      <tr>
        <td><span class="badge {{ $t->type }}">{{ str_replace('_', ' ', $t->type) }}</span></td>
        <td class="n">{{ number_format($t->n) }}</td>
        <td class="n">₱{{ number_format($t->total, 2) }}</td>
      </tr>
    @empty
      <tr><td colspan="3">No transactions yet.</td></tr>
    @endforelse
  </table></div>
</div>

<div class="card">
  <div class="k" style="margin-bottom:8px">Recent transactions</div>
  @include('partials.txn-table', ['rows' => $recent])
</div>
@endsection