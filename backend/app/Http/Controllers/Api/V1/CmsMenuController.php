<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CmsMenu;
use App\Models\CmsMenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="CMS Menus",
 *     description="Content Management System - Menus API"
 * )
 */
class CmsMenuController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('permission:view-cms-menus');
        
        $this->middleware('permission:create-cms-menus')->only(['store']);
        $this->middleware('permission:edit-cms-menus')->only(['update']);
        $this->middleware('permission:delete-cms-menus')->only(['destroy']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = CmsMenu::with(['creator', 'updater']);

        if ($request->filled('location')) {
            $query->where('location', $request->input('location'));
        }

        $menus = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Menus retrieved successfully',
            'menus' => $menus
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|in:header,footer,sidebar',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $menu = CmsMenu::create([
                'name' => $request->input('name'),
                'location' => $request->input('location'),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Menu created successfully',
                'data' => $menu->load(['creator', 'updater'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create menu: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        $menu = CmsMenu::with(['creator', 'updater', 'rootItems.children'])->find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Menu retrieved successfully',
            'data' => $menu
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $menu = CmsMenu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|in:header,footer,sidebar',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $menu->update([
                'name' => $request->input('name', $menu->name),
                'location' => $request->input('location', $menu->location),
                'updated_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Menu updated successfully',
                'data' => $menu->load(['creator', 'updater'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update menu: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $menu = CmsMenu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Delete all menu items first
            CmsMenuItem::where('menu_id', $id)->delete();
            
            // Delete the menu
            $menu->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Menu deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete menu: ' . $e->getMessage()
            ], 500);
        }
    }

    public function addItem(Request $request, int $id): JsonResponse
    {
        $menu = CmsMenu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'label' => 'required|string|max:255',
            'type' => 'required|in:page,link,feature',
            'target_id' => 'nullable|integer',
            'url' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|integer|exists:cms_menu_items,id',
            'is_visible' => 'nullable|boolean',
            'target_window' => 'nullable|in:_self,_blank',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $maxOrder = CmsMenuItem::where('menu_id', $id)
                ->where('parent_id', $request->input('parent_id'))
                ->max('order');

            $item = CmsMenuItem::create([
                'menu_id' => $id,
                'label' => $request->input('label'),
                'type' => $request->input('type'),
                'target_id' => $request->input('target_id'),
                'url' => $request->input('url'),
                'icon' => $request->input('icon'),
                'parent_id' => $request->input('parent_id'),
                'order' => ($maxOrder ?? 0) + 1,
                'is_visible' => $request->input('is_visible', true),
                'target_window' => $request->input('target_window', '_self'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Menu item added successfully',
                'data' => $item->load('children')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add menu item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function reorderItems(Request $request, int $id): JsonResponse
    {
        $menu = CmsMenu::find($id);

        if (!$menu) {
            return response()->json([
                'success' => false,
                'message' => 'Menu not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:cms_menu_items,id',
            'items.*.order' => 'required|integer|min:0',
            'items.*.parent_id' => 'nullable|integer|exists:cms_menu_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->input('items') as $item) {
                CmsMenuItem::where('id', $item['id'])
                    ->where('menu_id', $id)
                    ->update([
                        'order' => $item['order'],
                        'parent_id' => $item['parent_id'] ?? null,
                    ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Menu items reordered successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reorder menu items: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateItem(Request $request, int $id, int $itemId): JsonResponse
    {
        $item = CmsMenuItem::where('menu_id', $id)->find($itemId);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'label' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:page,link,feature',
            'target_id' => 'nullable|integer',
            'url' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:255',
            'parent_id' => 'nullable|integer|exists:cms_menu_items,id',
            'is_visible' => 'nullable|boolean',
            'target_window' => 'nullable|in:_self,_blank',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $item->update($request->only([
                'label', 'type', 'target_id', 'url', 'icon', 
                'parent_id', 'is_visible', 'target_window'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Menu item updated successfully',
                'data' => $item->load('children')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update menu item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteItem(int $id, int $itemId): JsonResponse
    {
        $item = CmsMenuItem::where('menu_id', $id)->find($itemId);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Menu item not found'
            ], 404);
        }

        try {
            DB::beginTransaction();

            // Delete children first
            CmsMenuItem::where('parent_id', $itemId)->delete();
            
            // Delete the item
            $item->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Menu item deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete menu item: ' . $e->getMessage()
            ], 500);
        }
    }
}

