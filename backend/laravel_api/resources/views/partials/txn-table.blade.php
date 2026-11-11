<div class="wrap">
  <table>
    <tr><th>Reference</th><th>Type</th><th>From</th><th>To</th><th class="n">Amount</th><th>Date</th></tr>
    @forelse ($rows as $t)
      <tr>
        <td>{{ $t->reference }}</td>
        <td><span class="badge {{ $t->type }}">{{ str_replace('_', ' ', $t->type) }}</span></td>
        <td>{{ $t->sender ?: '—' }}</td>
        <td>{{ $t->receiver ?: ($t->biller ?: '—') }}</td>
        <td class="n">₱{{ number_format($t->amount, 2) }}</td>
        <td>@manila($t->created_at)</td>
      </tr>
    @empty
      <tr><td colspan="6">No transactions found.</td></tr>
    @endforelse
  </table>
</div>