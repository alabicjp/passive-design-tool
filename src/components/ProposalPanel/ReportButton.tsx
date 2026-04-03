'use client';

export default function ReportButton() {
  const handlePrint = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    let img: HTMLImageElement | null = null;

    if (canvas) {
      img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.cssText = canvas.style.cssText;
      img.className = 'map-snapshot';
      canvas.parentElement?.insertBefore(img, canvas);
      canvas.style.display = 'none';
    }

    window.print();

    window.addEventListener(
      'afterprint',
      () => {
        if (canvas) {
          canvas.style.display = '';
          img?.remove();
        }
      },
      { once: true }
    );
  };

  return (
    <button
      onClick={handlePrint}
      className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
    >
      PDFレポート出力
    </button>
  );
}
