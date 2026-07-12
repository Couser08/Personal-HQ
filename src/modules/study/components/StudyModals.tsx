import { CustomSelect } from '../../../components/ui/CustomSelect';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import { Modal } from '../../../components/ui/Modal';

interface StudyModalsProps {
  noteModal: any;
  setNoteModal: (val: any) => void;
  handleSaveTopicNote: () => void;
  snippetModal: any;
  setSnippetModal: (val: any) => void;
  handleSaveTopicSnippet: () => void;
  resourceModal: any;
  setResourceModal: (val: any) => void;
  handleSaveTopicResource: () => void;
  questionModal: any;
  setQuestionModal: (val: any) => void;
  handleSaveTopicQuestion: () => void;
  flashcardModal: any;
  setFlashcardModal: (val: any) => void;
  handleSaveTopicFlashcard: () => void;
  isSubjectModalOpen: boolean;
  setIsSubjectModalOpen: (val: boolean) => void;
  subjectName: string;
  setSubjectName: (val: string) => void;
  semester: string;
  setSemester: (val: string) => void;
  handleSaveSubject: () => void;
  isTopicModalOpen: boolean;
  setIsTopicModalOpen: (val: boolean) => void;
  topicName: string;
  setTopicName: (val: string) => void;
  handleSaveTopic: () => void;
}

export function StudyModals({
  noteModal,
  setNoteModal,
  handleSaveTopicNote,
  snippetModal,
  setSnippetModal,
  handleSaveTopicSnippet,
  resourceModal,
  setResourceModal,
  handleSaveTopicResource,
  questionModal,
  setQuestionModal,
  handleSaveTopicQuestion,
  flashcardModal,
  setFlashcardModal,
  handleSaveTopicFlashcard,
  isSubjectModalOpen,
  setIsSubjectModalOpen,
  subjectName,
  setSubjectName,
  semester,
  setSemester,
  handleSaveSubject,
  isTopicModalOpen,
  setIsTopicModalOpen,
  topicName,
  setTopicName,
  handleSaveTopic,
}: StudyModalsProps) {
  return (
    <>
      {/* Topic Note Modal */}
      <Modal
        isOpen={noteModal.open}
        onClose={() => setNoteModal((prev: any) => ({ ...prev, open: false }))}
        title={noteModal.isReadOnly ? 'View Note' : noteModal.noteId ? 'Edit Note' : 'Create Note'}
        maxWidthClassName="max-w-4xl"
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          {noteModal.isReadOnly ? (
            <>
              <h3 className="text-lg font-bold text-text-primary select-text">{noteModal.title || 'Untitled Note'}</h3>
              <div
                className="prose dark:prose-invert max-h-96 overflow-y-auto p-4 bg-surface-alt border border-border-alt rounded-2xl text-xs font-semibold leading-relaxed text-text-secondary select-text"
                dangerouslySetInnerHTML={{ __html: noteModal.content || '<p class="italic text-text-muted">No content</p>' }}
              />
              <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
                <button
                  onClick={() => setNoteModal((prev: any) => ({ ...prev, open: false }))}
                  className="btn btn-secondary btn-md rounded-full px-5"
                >
                  Close
                </button>
                <button
                  onClick={() => setNoteModal((prev: any) => ({ ...prev, isReadOnly: false }))}
                  className="btn btn-primary btn-md rounded-full px-6"
                >
                  Edit Note
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Title"
                value={noteModal.title}
                onChange={(e) => setNoteModal((prev: any) => ({ ...prev, title: e.target.value }))}
                className="w-full bg-transparent border-none text-lg font-bold focus:outline-none placeholder:text-text-muted text-text-primary"
              />
              <RichTextEditor
                key={noteModal.noteId || 'new'}
                value={noteModal.content}
                onChange={(val) => setNoteModal((prev: any) => ({ ...prev, content: val }))}
              />
              <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
                <button
                  onClick={() => setNoteModal((prev: any) => ({ ...prev, open: false }))}
                  className="btn btn-secondary btn-md rounded-full px-5"
                >
                  Cancel
                </button>
                <button onClick={handleSaveTopicNote} className="btn btn-primary btn-md rounded-full px-6">
                  Save Note
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Code Snippet Modal */}
      <Modal
        isOpen={snippetModal.open}
        onClose={() => setSnippetModal((prev: any) => ({ ...prev, open: false }))}
        title={snippetModal.snippetId ? 'Edit Snippet' : 'Add Snippet'}
        maxWidthClassName="max-w-3xl"
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Title</label>
            <input
              type="text"
              placeholder="e.g. DFS Algorithm"
              value={snippetModal.title}
              onChange={(e) => setSnippetModal((prev: any) => ({ ...prev, title: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Language</label>
            <CustomSelect
              value={snippetModal.lang}
              onChange={(val) => setSnippetModal((prev: any) => ({ ...prev, lang: val }))}
              options={[
                { value: 'javascript', label: 'JavaScript' },
                { value: 'typescript', label: 'TypeScript' },
                { value: 'python', label: 'Python' },
                { value: 'cpp', label: 'C++' },
                { value: 'java', label: 'Java' },
                { value: 'html', label: 'HTML' },
                { value: 'css', label: 'CSS' },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Code</label>
            <textarea
              placeholder="// Code snippet..."
              value={snippetModal.code}
              onChange={(e) => setSnippetModal((prev: any) => ({ ...prev, code: e.target.value }))}
              className="w-full bg-[#1e1e1e] text-[#d4d4d4] border border-border-alt rounded-xl px-4 py-3 focus:outline-none focus:border-primary font-mono text-xs min-h-[160px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</label>
            <input
              type="text"
              placeholder="Short description..."
              value={snippetModal.desc}
              onChange={(e) => setSnippetModal((prev: any) => ({ ...prev, desc: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="dfs, algorithm"
              value={snippetModal.tags}
              onChange={(e) => setSnippetModal((prev: any) => ({ ...prev, tags: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
            <button
              onClick={() => setSnippetModal((prev: any) => ({ ...prev, open: false }))}
              className="btn btn-secondary btn-md rounded-full px-5"
            >
              Cancel
            </button>
            <button onClick={handleSaveTopicSnippet} className="btn btn-primary btn-md rounded-full px-6">
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Resource Link Modal */}
      <Modal
        isOpen={resourceModal.open}
        onClose={() => setResourceModal((prev: any) => ({ ...prev, open: false }))}
        title="Add Study Material Link"
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Title</label>
            <input
              type="text"
              placeholder="e.g. CPU Scheduling Tutorial"
              value={resourceModal.title}
              onChange={(e) => setResourceModal((prev: any) => ({ ...prev, title: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">URL</label>
            <input
              type="text"
              placeholder="https://..."
              value={resourceModal.url}
              onChange={(e) => setResourceModal((prev: any) => ({ ...prev, url: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Type</label>
            <CustomSelect
              value={resourceModal.type}
              onChange={(val) => setResourceModal((prev: any) => ({ ...prev, type: val as any }))}
              options={[
                { value: 'link', label: '🔗 Website' },
                { value: 'pdf', label: '📄 PDF' },
                { value: 'youtube', label: '📺 YouTube Link' },
                { value: 'doc', label: '📝 Doc Document' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
            <button
              onClick={() => setResourceModal((prev: any) => ({ ...prev, open: false }))}
              className="btn btn-secondary btn-md rounded-full px-5"
            >
              Cancel
            </button>
            <button onClick={handleSaveTopicResource} className="btn btn-primary btn-md rounded-full px-6">
              Add Link
            </button>
          </div>
        </div>
      </Modal>

      {/* Question Modal */}
      <Modal
        isOpen={questionModal.open}
        onClose={() => setQuestionModal((prev: any) => ({ ...prev, open: false }))}
        title="Add Question Node"
        maxWidthClassName="max-w-3xl"
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Question</label>
            <input
              type="text"
              placeholder="What is SJF scheduling?"
              value={questionModal.question}
              onChange={(e) => setQuestionModal((prev: any) => ({ ...prev, question: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Reference Answer</label>
            <textarea
              placeholder="Short outline..."
              value={questionModal.answer}
              onChange={(e) => setQuestionModal((prev: any) => ({ ...prev, answer: e.target.value }))}
              className="w-full bg-surface-alt border border-border-alt rounded-xl p-3 text-sm focus:outline-none focus:border-primary min-h-[100px] resize-vertical"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Difficulty</label>
            <CustomSelect
              value={questionModal.difficulty}
              onChange={(val) => setQuestionModal((prev: any) => ({ ...prev, difficulty: val as any }))}
              options={[
                { value: 'easy', label: '🟢 Easy' },
                { value: 'medium', label: '🟡 Medium' },
                { value: 'hard', label: '🔴 Hard' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
            <button
              onClick={() => setQuestionModal((prev: any) => ({ ...prev, open: false }))}
              className="btn btn-secondary btn-md rounded-full px-5"
            >
              Cancel
            </button>
            <button onClick={handleSaveTopicQuestion} className="btn btn-primary btn-md rounded-full px-6">
              Save Question
            </button>
          </div>
        </div>
      </Modal>

      {/* Flashcard Modal */}
      <Modal
        isOpen={flashcardModal.open}
        onClose={() => setFlashcardModal((prev: any) => ({ ...prev, open: false }))}
        title="Create Flashcard"
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Front (Question)</label>
            <input
              type="text"
              placeholder="e.g. What is Mutex?"
              value={flashcardModal.front}
              onChange={(e) => setFlashcardModal((prev: any) => ({ ...prev, front: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Back (Answer)</label>
            <input
              type="text"
              placeholder="e.g. Mutual Exclusion Object..."
              value={flashcardModal.back}
              onChange={(e) => setFlashcardModal((prev: any) => ({ ...prev, back: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border-alt">
            <button
              onClick={() => setFlashcardModal((prev: any) => ({ ...prev, open: false }))}
              className="btn btn-secondary btn-md rounded-full px-5"
            >
              Cancel
            </button>
            <button onClick={handleSaveTopicFlashcard} className="btn btn-primary btn-md rounded-full px-6">
              Create Card
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add Subject"
        maxWidthClassName="max-w-2xl"
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Subject Name</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Semester or Label</label>
            <input
              type="text"
              placeholder="e.g. Sem 4, Fall 2025"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsSubjectModalOpen(false)} className="btn btn-secondary btn-md rounded-full px-5">
              Cancel
            </button>
            <button onClick={handleSaveSubject} className="btn btn-primary btn-md rounded-full px-6">
              Add Subject
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Topic Modal */}
      <Modal isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} title="Add Topic" maxWidthClassName="max-w-2xl">
        <div className="flex flex-col gap-4 text-left font-sans">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Topic Name</label>
            <input
              type="text"
              placeholder="e.g. Memory Management"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsTopicModalOpen(false)} className="btn btn-secondary btn-md rounded-full px-5">
              Cancel
            </button>
            <button onClick={handleSaveTopic} className="btn btn-primary btn-md rounded-full px-6">
              Add Topic
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
