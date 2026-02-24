import { Star } from 'lucide-react';

export default function StarRating({ rating, onRate, readonly = false, size = 24 }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onRate && onRate(star)}
                    className={`transition-all duration-150 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                        }`}
                >
                    <Star
                        size={size}
                        className={`transition-colors ${star <= rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-transparent text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}
