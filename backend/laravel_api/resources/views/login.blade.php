@extends('layout')
@section('title', 'Log in')
@section('content')
<div class="card" style="max-width:380px;margin:80px auto">
  <h1><span class="brand">PayWallet</span> Admin</h1>
  <form method="POST" action="{{ route('login') }}">
    @csrf
    <p><input type="email" name="email" value="{{ old('email') }}" placeholder="Email" required autofocus style="width:100%"></p>
    <p><input type="password" name="password" placeholder="Password" required style="width:100%"></p>
    @error('email')<div class="err">{{ $message }}</div>@enderror
    <p><button class="btn" style="width:100%">Log in</button></p>
  </form>
</div>
@endsection