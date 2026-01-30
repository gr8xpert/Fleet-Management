<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Document Expiry Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .alert-item { background: white; border-left: 4px solid #1e40af; padding: 15px; margin: 10px 0; }
        .alert-item.urgent { border-left-color: #dc2626; }
        .alert-item.high { border-left-color: #f59e0b; }
        .priority { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .priority.urgent { background: #fecaca; color: #991b1b; }
        .priority.high { background: #fef3c7; color: #92400e; }
        .priority.medium { background: #dbeafe; color: #1e40af; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bus Fleet Management</h1>
            <p>Document Expiry Alert</p>
        </div>

        <div class="content">
            <p>The following documents are expiring and need your attention:</p>

            @foreach($alerts->sortBy('due_date') as $alert)
            <div class="alert-item {{ $alert->priority }}">
                <span class="priority {{ $alert->priority }}">{{ strtoupper($alert->priority) }}</span>
                <h3>{{ $alert->title }}</h3>
                <p>{{ $alert->message }}</p>
                <p><strong>Expires:</strong> {{ $alert->due_date->format('d M Y') }} ({{ $alert->days_before }} days left)</p>
            </div>
            @endforeach
        </div>

        <div class="footer">
            <p>This is an automated message from your Bus Fleet Management System.</p>
            <p>Please log in to the system to take action on these items.</p>
        </div>
    </div>
</body>
</html>
