<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Laravel's own tables live in "admin"; Django's tables are read from "public".
        config(['database.connections.pgsql.search_path' => 'admin,public']);
    }

    public function boot(): void
    {
        Blade::directive('manila', fn ($expr) =>
            "<?php echo \\Illuminate\\Support\\Carbon::parse({$expr})->timezone('Asia/Manila')->format('M d, Y h:i A'); ?>"
        );
    }
}