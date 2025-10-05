<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminApprovalController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');
        $query = User::whereHas('roles', fn($q) => $q->where('role', 'professionnel'));

        if ($status !== 'all') {
            if ($status === 'pending') $query->where('is_approved', false);
            if ($status === 'approved') $query->where('is_approved', true);
            if ($status === 'rejected') $query->whereNotNull('rejection_reason');
        }

        $data = $query->get();

        return response()->json([
            'success' => true,
            'data' => $data,
            'stats' => [
                'pending' => User::where('is_approved', false)->count(),
                'approved' => User::where('is_approved', true)->count(),
                'rejected' => User::whereNotNull('rejection_reason')->count(),
            ]
        ]);
    }

    public function approve($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_approved' => true, 'approved_at' => now(), 'rejection_reason' => null]);
        return response()->json(['success' => true, 'message' => 'Professionnel approuvé.']);
    }

    public function reject($id, Request $request)
    {
        $request->validate(['reason' => 'required|min:10']);
        $user = User::findOrFail($id);
        $user->update(['is_approved' => false, 'rejection_reason' => $request->reason]);
        return response()->json(['success' => true, 'message' => 'Professionnel rejeté.']);
    }

    public function revoke($id, Request $request)
    {
        $request->validate(['reason' => 'required|min:10']);
        $user = User::findOrFail($id);
        $user->update(['is_approved' => false, 'rejection_reason' => $request->reason]);
        return response()->json(['success' => true, 'message' => 'Approbation révoquée.']);
    }
}


