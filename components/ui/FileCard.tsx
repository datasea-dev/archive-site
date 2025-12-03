import { FileText, Download, Folder, ExternalLink } from 'lucide-react';

interface FileCardProps {
  title: string;
  type: 'PDF' | 'Folder' | 'Excel' | 'Image' | 'Link';
  date: string;
  size?: string;
  tag?: string;
}

export default function FileCard({ title, type, date, size, tag }: FileCardProps) {
  return (
    <div className="group relative bg-white p-5 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
      
      {/* 1. Efek Border Hover (Warna Abu Identitas) */}
      <div className="absolute inset-0 border border-transparent group-hover:border-datasea-gray/50 rounded-xl pointer-events-none transition-colors duration-300" />

      {/* 2. Header Kartu: Ikon & Tag */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-datasea-main
          ${type === 'Folder' ? 'bg-yellow-50 text-yellow-600' : 'bg-datasea-main/10'}`}>
          {type === 'Folder' ? <Folder size={20} /> : <FileText size={20} />}
        </div>
        
        {tag && (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
            {tag}
          </span>
        )}
      </div>

      {/* 3. Judul & Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-datasea-main transition-colors line-clamp-2 min-h-[3rem]">
          {title}
        </h3>
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <span>{date}</span>
          {size && <span>• {size}</span>}
        </p>
      </div>

      {/* 4. Footer Kartu: Action Button */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="text-xs font-medium text-gray-400">{type}</span>
        <button className="text-datasea-main hover:bg-datasea-main/5 p-1.5 rounded-md transition-colors">
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}