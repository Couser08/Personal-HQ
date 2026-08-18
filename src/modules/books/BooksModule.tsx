import React, { useState } from 'react';
import { LibraryDashboard } from './components/LibraryDashboard';
import NotebookEditor from './components/NotebookEditor';

const BooksModule: React.FC = () => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  return (
    <div data-component="BooksModule" className="w-full">
      {selectedBookId ? (
        <NotebookEditor
          bookId={selectedBookId}
          onBack={() => setSelectedBookId(null)}
        />
      ) : (
        <LibraryDashboard
          onSelectBook={(id: string) => setSelectedBookId(id)}
        />
      )}
    </div>
  );
};

export default BooksModule;
