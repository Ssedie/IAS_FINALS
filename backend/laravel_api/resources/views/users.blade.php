@extends('layout')
@section('title', 'Users')
@section('content')
<h1>Users</h1>
<form class="filters" method="GET">
  <input name="q" value="{{ $q }}" placeholder="Search name or mobile">
  <button class="btn">Search</button>
  <a class="btn alt" href="{{ route('users') }}">Reset</a>
</form>
<div class="card wrap">
  <table>
    <tr><th>Name</th><th>Mobile</th><th class="n">Balance</th><th>Joined</th><th>Status</th></tr>
    @forelse ($rows as $u)
      <tr>
        <td>{{ $u->first_name }} {{ $u->last_name }}</td>
        <td>{{ $u->mobile_number }}</td>
        <td class="n">₱{{ number_format($u->balance, 2) }}</td>
        <td>@manila($u->date_joined)</td>
        <td>@if ($u->is_active)<span class="badge">Active</span>@else<span class="badge off">Disabled</span>@endif</td>
      </tr>
    @empty
      <tr><td colspan="5">No users found.</td></tr>
    @endforelse
  </table>
  @include('partials.pager')
</div>
@endsection