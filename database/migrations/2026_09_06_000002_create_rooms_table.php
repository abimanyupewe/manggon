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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->string('room_number');
            $table->integer('floor')->default(1);
            $table->decimal('price', 12, 2);
            $table->string('status')->default('empty');
            $table->json('facilities')->nullable();
            $table->json('images')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['property_id', 'room_number']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
