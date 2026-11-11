@extends('layout')
@section('title', 'Audit log')
@section('content')
<h1>Audit log</h1>
<div class="card wrap">
  <table>
    <tr><th>When</th><th>Admin</th><th>Action</th><th>Details</th><th>IP</th></tr>
    @forelse ($rows as $log)
      <tr>
        <td>@manila($log->created_at)</td>
        <td>{{ $log->user?->email ?? '—' }}</td>
        <td><span class="badge {{ $log->action === 'login_failed' ? 'off' : '' }}">{{ $log->action }}</span></td>
        <td>{{ $log->details ?? '' }}</td>
        <td>{{ $log->ip_address }}</td>
      </tr>
    @empty
      <tr><td colspan="5">No entries yet.</td></tr>
    @endforelse
  </table>
  @include('partials.pager')
</div>
@endsection