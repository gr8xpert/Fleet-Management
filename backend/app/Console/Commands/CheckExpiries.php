<?php

namespace App\Console\Commands;

use App\Mail\ExpiryAlertMail;
use App\Models\Alert;
use App\Models\Employee;
use App\Models\User;
use App\Models\VehicleDocument;
use App\Models\Visa;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class CheckExpiries extends Command
{
    protected $signature = 'fleet:check-expiries';
    protected $description = 'Check for expiring documents and send alerts';

    public function handle()
    {
        $alertDays = explode(',', config('app.alert_days', '30,15,7'));

        $this->info('Checking for expiring documents...');

        foreach ($alertDays as $days) {
            $days = (int) trim($days);
            $this->checkMulkiyaExpiries($days);
            $this->checkInsuranceExpiries($days);
            $this->checkVisaExpiries($days);
            $this->checkLicenseExpiries($days);
            $this->checkPassportExpiries($days);
        }

        $this->sendAlertEmails();

        $this->info('Expiry check completed.');

        return Command::SUCCESS;
    }

    protected function checkMulkiyaExpiries(int $days): void
    {
        $documents = VehicleDocument::with('vehicle')
            ->where('document_type', 'mulkiya')
            ->where('is_active', true)
            ->whereDate('expiry_date', now()->addDays($days)->toDateString())
            ->get();

        foreach ($documents as $doc) {
            $this->createAlert(
                'mulkiya_expiry',
                "Mulkiya Expiring - {$doc->vehicle->bus_number}",
                "Mulkiya for vehicle {$doc->vehicle->bus_number} ({$doc->vehicle->plate_number}) expires on {$doc->expiry_date->format('d M Y')}",
                $doc,
                $doc->expiry_date,
                $days
            );
        }

        $this->info("Found {$documents->count()} mulkiya expiring in {$days} days");
    }

    protected function checkInsuranceExpiries(int $days): void
    {
        $documents = VehicleDocument::with('vehicle')
            ->where('document_type', 'insurance')
            ->where('is_active', true)
            ->whereDate('expiry_date', now()->addDays($days)->toDateString())
            ->get();

        foreach ($documents as $doc) {
            $this->createAlert(
                'insurance_expiry',
                "Insurance Expiring - {$doc->vehicle->bus_number}",
                "Insurance for vehicle {$doc->vehicle->bus_number} ({$doc->vehicle->plate_number}) expires on {$doc->expiry_date->format('d M Y')}",
                $doc,
                $doc->expiry_date,
                $days
            );
        }

        $this->info("Found {$documents->count()} insurance expiring in {$days} days");
    }

    protected function checkVisaExpiries(int $days): void
    {
        $visas = Visa::with('employee')
            ->where('status', 'active')
            ->whereDate('expiry_date', now()->addDays($days)->toDateString())
            ->get();

        foreach ($visas as $visa) {
            $this->createAlert(
                'visa_expiry',
                "Visa Expiring - {$visa->employee->name}",
                "Visa for {$visa->employee->name} expires on {$visa->expiry_date->format('d M Y')}",
                $visa,
                $visa->expiry_date,
                $days
            );
        }

        $this->info("Found {$visas->count()} visas expiring in {$days} days");
    }

    protected function checkLicenseExpiries(int $days): void
    {
        $employees = Employee::active()
            ->whereNotNull('license_expiry')
            ->whereDate('license_expiry', now()->addDays($days)->toDateString())
            ->get();

        foreach ($employees as $employee) {
            $this->createAlert(
                'license_expiry',
                "License Expiring - {$employee->name}",
                "Driving license for {$employee->name} expires on {$employee->license_expiry->format('d M Y')}",
                $employee,
                $employee->license_expiry,
                $days
            );
        }

        $this->info("Found {$employees->count()} licenses expiring in {$days} days");
    }

    protected function checkPassportExpiries(int $days): void
    {
        $employees = Employee::active()
            ->whereNotNull('passport_expiry')
            ->whereDate('passport_expiry', now()->addDays($days)->toDateString())
            ->get();

        foreach ($employees as $employee) {
            $this->createAlert(
                'passport_expiry',
                "Passport Expiring - {$employee->name}",
                "Passport for {$employee->name} expires on {$employee->passport_expiry->format('d M Y')}",
                $employee,
                $employee->passport_expiry,
                $days
            );
        }

        $this->info("Found {$employees->count()} passports expiring in {$days} days");
    }

    protected function createAlert(string $type, string $title, string $message, $model, $dueDate, int $daysBefore): void
    {
        // Check if alert already exists
        $exists = Alert::where('type', $type)
            ->where('alertable_type', get_class($model))
            ->where('alertable_id', $model->id)
            ->where('days_before', $daysBefore)
            ->exists();

        if ($exists) {
            return;
        }

        $priority = match (true) {
            $daysBefore <= 7 => 'urgent',
            $daysBefore <= 15 => 'high',
            default => 'medium',
        };

        Alert::create([
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'priority' => $priority,
            'alertable_type' => get_class($model),
            'alertable_id' => $model->id,
            'due_date' => $dueDate,
            'days_before' => $daysBefore,
        ]);
    }

    protected function sendAlertEmails(): void
    {
        if (!config('app.alert_email_enabled', true)) {
            return;
        }

        $alerts = Alert::unsent()->with('alertable')->get();

        if ($alerts->isEmpty()) {
            return;
        }

        // Get admin/manager users to send emails
        $recipients = User::whereIn('role', ['admin', 'manager'])
            ->where('is_active', true)
            ->pluck('email')
            ->toArray();

        if (empty($recipients)) {
            return;
        }

        try {
            Mail::to($recipients)->send(new ExpiryAlertMail($alerts));

            Alert::whereIn('id', $alerts->pluck('id'))->update([
                'is_sent' => true,
                'sent_at' => now(),
            ]);

            $this->info("Sent alert email to " . count($recipients) . " recipients");
        } catch (\Exception $e) {
            $this->error("Failed to send alert email: " . $e->getMessage());
        }
    }
}
