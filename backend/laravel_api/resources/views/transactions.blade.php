@extends('layout')
@section('title', 'Transactions')
@section('content')
<h1>Transactions</h1>
<form class="filters" method="GET">
  <input name="q" value="{{ request('q') }}" placeholder="Reference">
  <select name="type">
    <option value="">All types</option>
    @foreach (['CASH_IN' => 'Cash in', 'SEND' => 'Send money', 'BILL_PAYMENT' => 'Bill payment'] as $v => $label)
      <option value="{{ $v }}" @selected(request('type') === $v)>{{ $label }}</option>
    @endforeach
  </select>
  <input type="date" name="from" value="{{ request('from') }}">
  <input type="date" name="to" value="{{ request('to') }}">
  <button class="btn">Filter</button>
  <a class="btn alt" href="{{ route('transactions') }}">Reset</a>
  <a class="btn alt" href="{{ route('transactions.export', request()->query()) }}">Export CSV</a>
</form>
<div class="card">
  @include('partials.txn-table')
  @include('partials.pager')
</div>
@endsection