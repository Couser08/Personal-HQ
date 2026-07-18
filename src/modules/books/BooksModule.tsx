import React, { useState } from 'react';
import LibraryDashboard from './components/LibraryDashboard';
import NotebookEditor from './components/NotebookEditor';

const BooksModule: React.FC = () => {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  if (selectedBookId) {
    return (
      <NotebookEditor
        bookId={selectedBookId}
        onBack={() => setSelectedBookId(null)}
      />
    );
  }

  return (
    <LibraryDashboard
      onSelectBook={(id) => setSelectedBookId(id)}
    />
  );
};

export default BooksModule;
