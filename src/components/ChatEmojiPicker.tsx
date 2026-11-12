import EmojiPicker from 'emoji-picker-react';

export default function ChatEmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  return (
    <div className="fni-emoji-picker-popover" role="dialog" aria-label="Emoji library">
      <EmojiPicker
        onEmojiClick={emoji => onSelect(emoji.emoji)}
        width="100%"
        height={350}
        searchPlaceHolder="Search all emojis"
        previewConfig={{ showPreview: false }}
        lazyLoadEmojis
        skinTonesDisabled={false}
      />
    </div>
  );
}
