import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';

export default function ComicListItem({ comic }) {
  const { api } = useConfig();
  const [imageError, setImageError] = useState(false);

  const comicId = comic.ComicID || comic.id;
  const coverUrl = comic.ComicImageURL || comic.imageURL || api.getArtUrl(comicId);
  const name = comic.ComicName || comic.name;
  const year = comic.ComicYear || comic.year;
  const publisher = comic.ComicPublisher || comic.publisher;
  const totalIssues = comic.Total || comic.totalIssues || comic.TotalIssues || comic.issues;

  return (
    <Link
      to={`/comic/${comicId}`}
      className="flex gap-3 p-3 bg-bg-secondary rounded-lg active:bg-bg-tertiary transition-colors"
    >
      <div className="w-12 flex-shrink-0">
        <div className="aspect-[2/3] bg-bg-tertiary rounded overflow-hidden">
          {!imageError && coverUrl ? (
            <img
              src={coverUrl}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <span className="text-xl">?</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-medium text-text-primary truncate">{name}</h3>
        <p className="text-sm text-text-secondary truncate">
          {year}
          {publisher && ` • ${publisher}`}
        </p>
      </div>
      {totalIssues && (
        <div className="flex-shrink-0 self-center">
          <span className="inline-flex px-2 py-1 rounded text-xs bg-bg-tertiary text-text-secondary">
            {totalIssues} issues
          </span>
        </div>
      )}
    </Link>
  );
}
