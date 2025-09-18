<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
<<<<<<< HEAD
        return  EventResource::collection(Event::all());

=======
        $events = Event::all();
        return EventResource::collection($events);
>>>>>>> 4d8113ed069d18e88867e4163b78dec42ab59f7d
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'start_date'       => 'required|date',
            'end_date'         => 'required|date|after_or_equal:start_date',
            'base_price'       => 'required|numeric|min:0',
            'capacity'         => 'required|integer|min:1',
            'max_places'       => 'required|integer|min:1',
            'available_places' => 'required|integer|min:0',
            'level'            => 'nullable|string|max:50',
            'priority'         => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $event = Event::create($validator->validated());
        return new EventResource($event);
    }

    /**
     * Afficher un seul evenement selon son id
     */
   public function show($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json([
                'message' => 'Event not found'
            ], 404);
        }

        return new EventResource($event);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'             => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'start_date'       => 'sometimes|required|date',
            'end_date'         => 'sometimes|required|date|after_or_equal:start_date',
            'base_price'       => 'sometimes|required|numeric|min:0',
            'capacity'         => 'sometimes|required|integer|min:1',
            'max_places'       => 'sometimes|required|integer|min:1',
            'available_places' => 'sometimes|required|integer|min:0',
            'level'            => 'nullable|string|max:50',
            'priority'         => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $event->update($validator->validated());
        return new EventResource($event);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $event = Event::find($id);
        if (!$event) {
            return response()->json(['message' => 'Event not found'], 404);
        }

        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ], 200);
    }
}
