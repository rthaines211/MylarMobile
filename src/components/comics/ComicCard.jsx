import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export default function ComicCard({ comic }) {
  const { api } = useConfig();
  const [imageError, setImageError] = useState(false);

  const comicId = comic.ComicID || comic.id;
  // Try direct image URL first, then fall back to Mylar's getArt endpoint
  const coverUrl = comic.ComicImageURL || comic.imageURL || api.getArtUrl(comicId);

  // Get total issues count
  const totalIssues = comic.Total || comic.totalIssues || comic.TotalIssues || comic.issues;

  return (
    <Link
      to={`/comic/${comicId}`}
      className="block bg-bg-secondary rounded-lg overflow-hidden active:scale-[0.98] transition-transform"
    >
      <div className="relative aspect-[2/3] bg-bg-tertiary">
        {!imageError && coverUrl ? (
          <img
            src={coverUrl}
            alt={comic.ComicName || comic.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <span className="text-4xl">?</span>
          </div>
        )}
        {totalIssues && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-black/60 text-white">
            {totalIssues} issues
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm text-text-primary truncate">
          {comic.ComicName || comic.name}
        </h3>
        <p className="text-xs text-text-secondary truncate">
          {comic.ComicYear || comic.year}
          {comic.ComicPublisher && ` • ${comic.ComicPublisher}`}
        </p>
      </div>
    </Link>
  );
}
