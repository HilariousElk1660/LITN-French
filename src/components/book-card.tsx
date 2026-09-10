import { Link } from "@tanstack/react-router";
import type { Book } from "@/lib/books";
import { Bookmark } from 'lucide-react';

export function BookCard({ book }: { book: Book }) {
  const getGenreColor = (genre: string) => {
  switch (genre.toLowerCase()) {
    case 'clinical review':
      return 'text-purple-600';
    case 'anatomy':
      return 'text-teal-600';
    case 'pharmacology':
      return 'text-emerald-600';
    case 'emergency medicine':
      return 'text-red-500';
    default:
      return 'text-teal-600';
  }
};
  return (
    <Link
      to="/book/$id"
      params={{ id: book.id }}
      className="group block"
    >
    <div
            key={book.id}
            className="flex flex-col rounded-3xl border border-slate-700/50 overflow-hidden bg-[#2D3836]"
          >
            {/* Top Cover Section */}
            <div className="relative p- h-72 bg-[#234543] flex flex-col justify-between">
              {/* Category / Genre Tag */}
              <div>
                <span
                  style={{border:"2px solid #234543"}}
                  className={`absolute inline-block px-4 py-1.5 m-1.5 bg-white rounded-full  text-xs font-bold tracking-wide ${getGenreColor(
                    book.genre
                  )}`}
                >
                  {book.genre}
                </span>
              </div>

              {/* Cover Image or Fallback Placeholder */}
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-58 object-contain rounded-md my-auto"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-6 my-auto">
                  <Bookmark className="w-10 h-10 text-teal-800/60 stroke-[1.5]" />
                  <span className="text-white text-sm font-semibold opacity-90">
                    {book.title}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Content Section */}
            <div className="p-6 bg-[#2B3534] flex flex-col justify-between flex-1 gap-6">
              <div>
                <h3 className="text-white text-lg font-bold leading-snug line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-slate-300 text-sm mt-1 font-medium">
                  {book.author}
                </p>

                {/* Chapters & Price Row */}
                <div className="flex items-center justify-between text-white text-sm font-semibold mt-4">
                  <span className="text-slate-200">{book.chapters} Chapters</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span className="text-white text-base font-bold">
                    {book.currency}
                    {book.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectBook?.(book)}
                className="w-full py-3 bg-[#E6F8F6] hover:bg-[#d8f3f0] text-[#00A399] font-bold text-sm rounded-full transition-colors duration-200 cursor-pointer text-center"
              >
                View details / Order
              </button>
            </div>
          </div>
    </Link>
  );
}
