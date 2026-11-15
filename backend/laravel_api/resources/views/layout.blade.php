<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@yield('title', 'Admin') · PayWallet</title>
<style>
:root{--green:#12b76a;--ink:#0b1b14;--bg:#f4f7f5;--line:#e3e9e5;--muted:#6b7a72}
*{box-sizing:border-box}
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink)}
header{background:var(--ink);color:#fff;display:flex;align-items:center;gap:24px;padding:0 24px;height:56px}
.brand{font-weight:700;color:var(--green);font-size:18px}
header nav{display:flex;gap:4px;flex:1;flex-wrap:wrap}
header nav a{color:#cfe3d8;text-decoration:none;padding:8px 12px;border-radius:8px;font-size:14px}
header nav a.on,header nav a:hover{background:#17342a;color:#fff}
header button{background:none;border:1px solid #2c4a3d;color:#cfe3d8;border-radius:8px;padding:6px 12px;cursor:pointer}
main{max-width:1100px;margin:24px auto;padding:0 16px}
h1{font-size:22px;margin:0 0 16px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}
.grid .card{margin:0}
.k{color:var(--muted);font-size:13px}
.v{font-size:24px;font-weight:700;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line)}
th{color:var(--muted);font-weight:600;font-size:12px;text-transform:uppercase}
td.n,th.n{text-align:right}
.wrap{overflow-x:auto}
.badge{padding:2px 8px;border-radius:99px;font-size:12px;background:#e7f6ee;color:#0a7a47;white-space:nowrap}
.badge.SEND{background:#e8f0fe;color:#1a4fb4}
.badge.BILL_PAYMENT{background:#fff4e0;color:#9a5b00}
.badge.off{background:#fde8e8;color:#b42318}
form.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
input,select{padding:8px 10px;border:1px solid var(--line);border-radius:8px;font:inherit;background:#fff}
.btn{background:var(--green);color:#fff;border:0;border-radius:8px;padding:8px 14px;font:inherit;cursor:pointer;text-decoration:none;display:inline-block}
.btn.alt{background:#fff;color:var(--ink);border:1px solid var(--line)}
.pager{display:flex;gap:16px;justify-content:center;padding-top:12px;color:var(--muted)}
.pager a{color:var(--green);text-decoration:none}
.bars{display:flex;align-items:flex-end;gap:12px;height:150px}
.bar{flex:1;text-align:center;font-size:12px;color:var(--muted)}
.bar i{display:block;background:var(--green);border-radius:6px 6px 0 0;min-height:2px;margin-bottom:6px}
.err{color:#b42318;font-size:13px;margin-top:6px}
</style>
</head>
<body>
@auth
<header>
  <span class="brand">PayWallet Admin</span>
  <nav>
    <a href="{{ route('dashboard') }}" class="{{ request()->routeIs('dashboard') ? 'on' : '' }}">Dashboard</a>
    <a href="{{ route('users') }}" class="{{ request()->routeIs('users') ? 'on' : '' }}">Users</a>
    <a href="{{ route('transactions') }}" class="{{ request()->routeIs('transactions*') ? 'on' : '' }}">Transactions</a>
    <a href="{{ route('audit') }}" class="{{ request()->routeIs('audit') ? 'on' : '' }}">Audit log</a>
  </nav>
  <form method="POST" action="{{ route('logout') }}">@csrf<button>Log out</button></form>
</header>
@endauth
<main>@yield('content')</main>
</body>
</html>