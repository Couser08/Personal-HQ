import React from 'react';
import { IconPlus } from '@tabler/icons-react';
import { PRESET_COVERS, BookCover } from '../../utils/presetCovers';
import { supabase } from '../../../../lib/supabase';
import { useAuthStore } from '../../../../store/useAuthStore';
import { compressAndConvertToWebP } from '../../../../utils/imageOptimizer';

interface BookDetailsModalProps {
  titleInput: string;
  setTitleInput: (val: string) => void;
  taglineInput: string;
  setTaglineInput: (val: string) => void;
  bookAuthorInput: string;
  setBookAuthorInput: (val: string) => void;
  bookCoverInput: string;
  setBookCoverInput: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  titleInput,
  setTitleInput,
  taglineInput,
  setTaglineInput,
  bookAuthorInput,
  setBookAuthorInput,
  bookCoverInput,
  setBookCoverInput,
  onClose,
  onSave,
}) => {
  return (
    <>
      <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
        <div>
          <h3 className="text-base font-black text-text-primary">⚙ Configure Notebook Settings</h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Customize title, subtitle, author, and cover art</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 transition-colors border rounded-full cursor-pointer hover:bg-surface-hover border-border/40 text-text-muted hover:text-text-primary"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-5 py-6 overflow-y-auto px-7 max-h-[50vh] scrollbar-thin">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-notebook-title" className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Notebook Title</label>
            <input
              id="edit-notebook-title"
              name="title"
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              placeholder="Notebook Title"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-notebook-author" className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Author Name</label>
            <input
              id="edit-notebook-author"
              name="author"
              type="text"
              value={bookAuthorInput}
              onChange={(e) => setBookAuthorInput(e.target.value)}
              className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
              placeholder="Author Name"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit-notebook-tagline" className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Subtitle / Tagline</label>
          <input
            id="edit-notebook-tagline"
            name="tagline"
            type="text"
            value={taglineInput}
            onChange={(e) => setTaglineInput(e.target.value)}
            className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            placeholder="Notebook Subtitle/Tagline"
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Cover Design</label>
            <label className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform flex items-center gap-1">
              <IconPlus size={10} /> Change Custom Cover (3:4 ratio - JPG, PNG)
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const user = useAuthStore.getState().user;
                    if (user) {
                      compressAndConvertToWebP(file, 800, 0.8)
                        .then((optimizedFile) => {
                          const fileName = `${user.id}/book-covers/${crypto.randomUUID()}.webp`;
                          supabase.storage
                            .from('avatars')
                            .upload(fileName, optimizedFile, { 
                              cacheControl: '31536000', 
                              upsert: true,
                              contentType: 'image/webp'
                            })
                            .then(({ error }) => {
                              if (error) {
                                console.error('Upload error:', error);
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setBookCoverInput(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              } else {
                                const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
                                setBookCoverInput(data.publicUrl);
                              }
                            });
                        })
                        .catch((err) => {
                          console.error('[NotebookEditor] Compression error:', err);
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setBookCoverInput(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                    } else {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setBookCoverInput(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              />
            </label>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {PRESET_COVERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setBookCoverInput(preset.id)}
                className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer active:scale-[0.97] ${
                  bookCoverInput === preset.id
                    ? 'border-rose-500 scale-[1.03] shadow-md shadow-rose-500/10'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <BookCover presetId={preset.id} title={titleInput || 'Untitled'} showDetails={false} />
              </button>
            ))}

            {(bookCoverInput.startsWith('data:image/') || bookCoverInput.startsWith('http')) && (
              <button
                type="button"
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-rose-500 scale-[1.03] shadow-md p-0.5 cursor-default"
              >
                <BookCover presetId={bookCoverInput} title={titleInput || 'Untitled'} showDetails={false} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[8px] font-bold text-white uppercase">
                  Custom
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 py-5 border-t px-7 border-border/60">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-2xl text-sm font-bold text-text-secondary cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100 shadow-md"
        >
          Save Changes
        </button>
      </div>
    </>
  );
};
