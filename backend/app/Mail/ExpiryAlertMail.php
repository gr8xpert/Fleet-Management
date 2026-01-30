<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class ExpiryAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public Collection $alerts;

    public function __construct(Collection $alerts)
    {
        $this->alerts = $alerts;
    }

    public function envelope(): Envelope
    {
        $urgentCount = $this->alerts->whereIn('priority', ['urgent', 'high'])->count();
        $subject = $urgentCount > 0
            ? "[URGENT] {$urgentCount} expiring documents need attention"
            : "Document Expiry Alert - {$this->alerts->count()} items";

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.expiry-alert');
    }
}
