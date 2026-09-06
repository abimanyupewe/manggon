<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('username')->unique()->nullable();
            $table->string('phone_number')->nullable();
            $table->string('role')->default('tenant');
            $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->boolean('must_change_password')->default(false);

            $table->index('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['property_id']);
            $table->dropIndex(['role']);
            $table->dropColumn([
                'username',
                'phone_number',
                'role',
                'property_id',
                'is_active',
                'must_change_password',
            ]);
            $table->string('email')->nullable(false)->change();
        });
    }
};
