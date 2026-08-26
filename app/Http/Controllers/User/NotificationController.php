<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $user = request()->user();

        $notifications = $user->notifications()->paginate(15);

        return \Inertia\Inertia::render('profile/Notifications', [
            'notifications' => $notifications->through(fn ($n) => [
                'id' => $n->id,
                'title' => data_get($n->data, 'title'),
                'message' => data_get($n->data, 'message'),
                'url' => data_get($n->data, 'url'),
                'read_at' => $n->read_at?->toIso8601String(),
                'created_at' => $n->created_at->toIso8601String(),
            ]),
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    public function markRead(string $id)
    {
        $notification = request()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back();
    }

    public function markAllRead()
    {
        request()->user()->unreadNotifications->markAsRead();

        return back();
    }
}
