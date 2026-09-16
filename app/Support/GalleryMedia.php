<?php

namespace App\Support;

class GalleryMedia
{
    /** @var list<string> */
    public const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    /** @var list<string> */
    public const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

    public const IMAGE_MAX_KILOBYTES = 10240;

    public const VIDEO_MAX_KILOBYTES = 10240;

    public static function allowedKilobytes(string $type): int
    {
        $wanted = $type === 'video' ? self::VIDEO_MAX_KILOBYTES : self::IMAGE_MAX_KILOBYTES;
        $server = self::serverUploadKilobytes();

        if ($server <= 0) {
            return $wanted;
        }

        return min($wanted, $server);
    }

    public static function serverUploadKilobytes(): int
    {
        $limits = array_filter([
            self::iniKilobytes((string) ini_get('upload_max_filesize')),
            self::iniKilobytes((string) ini_get('post_max_size')),
        ], fn (int $value) => $value > 0);

        return $limits === [] ? 0 : min($limits);
    }

    public static function iniKilobytes(string $value): int
    {
        $value = trim($value);

        if ($value === '') {
            return 0;
        }

        $unit = strtolower(substr($value, -1));
        $number = (float) $value;
        $bytes = match ($unit) {
            'g' => $number * 1024 * 1024 * 1024,
            'm' => $number * 1024 * 1024,
            'k' => $number * 1024,
            default => $number,
        };

        return (int) floor($bytes / 1024);
    }

    public static function typeForPath(string $path): ?string
    {
        $extension = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?: $path, PATHINFO_EXTENSION));

        return self::typeForExtension($extension);
    }

    public static function typeForExtension(string $extension): ?string
    {
        $extension = strtolower($extension);

        if (in_array($extension, self::IMAGE_EXTENSIONS, true)) {
            return 'image';
        }

        if (in_array($extension, self::VIDEO_EXTENSIONS, true)) {
            return 'video';
        }

        return null;
    }

    public static function mimeAllowed(string $type, string $mime): bool
    {
        $mime = strtolower($mime);

        // Some Windows PHP builds cannot detect MIME. The extension allow-list still applies.
        if ($mime === '' || $mime === 'application/octet-stream' || $mime === 'application/x-empty') {
            return true;
        }

        $allowed = $type === 'video'
            ? ['video/mp4', 'video/webm', 'video/quicktime', 'application/mp4', 'video/x-m4v']
            : ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        return in_array($mime, $allowed, true);
    }

    public static function isSafePublicPath(string $path): bool
    {
        if (str_contains($path, '..') || str_contains($path, '\\') || str_contains($path, "\0")) {
            return false;
        }

        return str_starts_with($path, '/assets/images/') || str_starts_with($path, '/assets/videos/');
    }

    /**
     * Public gallery items. Unsafe or unknown files are omitted.
     *
     * @return list<array{url: string, type: string}>
     */
    public static function fromStored(mixed $raw): array
    {
        $items = self::normalizeList($raw);
        $media = [];

        foreach ($items as $item) {
            if (! is_string($item) || ! self::isSafePublicPath($item)) {
                continue;
            }

            $type = self::typeForPath($item);

            if ($type === null) {
                continue;
            }

            $media[] = [
                'url' => $item,
                'type' => $type,
            ];
        }

        return $media;
    }

    /**
     * Admin list keeps every stored index so delete still targets the right file.
     *
     * @return list<array{url: string, type: string}>
     */
    public static function forAdmin(mixed $raw): array
    {
        $media = [];

        foreach (self::normalizeList($raw) as $item) {
            $url = is_string($item) ? $item : '';
            $type = is_string($item) ? (self::typeForPath($item) ?? 'file') : 'file';

            $media[] = [
                'url' => $url,
                'type' => $type,
            ];
        }

        return $media;
    }

    public static function deletableAbsolutePath(string $publicPath): ?string
    {
        if (! self::isSafePublicPath($publicPath)) {
            return null;
        }

        $fullPath = public_path(ltrim($publicPath, '/'));

        if (! is_file($fullPath)) {
            return null;
        }

        $real = realpath($fullPath);

        if ($real === false) {
            return null;
        }

        foreach (['assets/images', 'assets/videos'] as $folder) {
            $directory = realpath(public_path($folder));

            if ($directory === false) {
                continue;
            }

            $prefix = rtrim($directory, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;

            if (str_starts_with($real, $prefix)) {
                return $real;
            }
        }

        return null;
    }

    /**
     * @return list<mixed>
     */
    private static function normalizeList(mixed $raw): array
    {
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);

            return is_array($decoded) ? array_values($decoded) : [];
        }

        return is_array($raw) ? array_values($raw) : [];
    }
}
