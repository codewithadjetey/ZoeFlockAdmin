<?php
/**
 * @OA\Schema(
 *   schema="Group",
 *   type="object",
 *   title="Group",
 *   required={"name"},
 *   @OA\Property(property="id", type="integer", example=1),
 *   @OA\Property(property="name", type="string", example="Youth Group"),
 *   @OA\Property(property="description", type="string", example="A group for young people"),
 *   @OA\Property(property="max_members", type="integer", example=20),
 *   @OA\Property(property="meeting_day", type="string", example="Sunday"),
 *   @OA\Property(property="meeting_time", type="string", example="10:00 AM"),
 *   @OA\Property(property="location", type="string", example="Main Hall"),
 *   @OA\Property(property="img_path", type="string", example="/images/groups/youth.png"),
 *   @OA\Property(property="status", type="string", example="Active"),
 *   @OA\Property(property="deleted", type="boolean", example=false),
 *   @OA\Property(property="created_by", type="integer", example=1),
 *   @OA\Property(property="updated_by", type="integer", example=2),
 *   @OA\Property(property="created_at", type="string", format="date-time"),
 *   @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */