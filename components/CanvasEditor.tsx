import React, { useEffect, useRef, useState } from 'react';

// For using Fabric.js from a CDN
declare const fabric: any;

interface CanvasEditorProps {
  imageUrl: string;
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({ imageUrl, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#111827',
        preserveObjectStacking: true,
    });
    fabricCanvasRef.current = canvas;
    
    fabric.Image.fromURL(imageUrl, (img: any) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height,
        });
    }, { crossOrigin: 'anonymous' });

    canvas.on('selection:created', (e: any) => setSelectedObject(e.target));
    canvas.on('selection:updated', (e: any) => setSelectedObject(e.target));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    // Handle resizing
    const resizeCanvas = () => {
        const container = canvas.wrapperEl.parentElement;
        const width = container.clientWidth;
        const height = width * 0.75; // Maintain an aspect ratio
        canvas.setDimensions({ width, height });
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [imageUrl]);

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    const text = new fabric.IText('Your Text Here', {
      left: 50,
      top: 50,
      fill: '#FFFFFF',
      fontSize: 40,
      fontFamily: 'Arial',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result;
      fabric.Image.fromURL(data, (img: any) => {
        img.scale(0.3);
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.centerObject(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };
  
  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      setSelectedObject(null);
    }
  };

  const handleColorChange = (color: string) => {
      if (selectedObject && selectedObject.isType('i-text')) {
          selectedObject.set('fill', color);
          fabricCanvasRef.current.renderAll();
      }
  }

  const handleFontSizeChange = (size: string) => {
      if (selectedObject && selectedObject.isType('i-text')) {
          selectedObject.set('fontSize', parseInt(size, 10));
          fabricCanvasRef.current.renderAll();
      }
  }

  const handleSave = () => {
    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1.0,
    });
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-40 flex flex-col p-4">
        {/* Header and Toolbar */}
        <div className="bg-gray-800 rounded-lg p-3 shadow-lg mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                 <button onClick={addText} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">Add Text</button>
                 <label className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer">
                    Add Image
                    <input type="file" className="hidden" accept="image/*" onChange={addImage} />
                 </label>
                 {selectedObject && (
                    <button onClick={deleteSelected} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Delete Selected</button>
                 )}
            </div>
             {selectedObject && selectedObject.isType('i-text') && (
                <div className="flex items-center gap-2 border-l border-gray-600 pl-4 flex-wrap">
                    <label className="text-sm text-gray-300">Color:</label>
                    <input type="color" defaultValue={selectedObject.fill} onChange={e => handleColorChange(e.target.value)} className="bg-gray-700 border border-gray-600 rounded" />
                    <label className="text-sm text-gray-300">Size:</label>
                    <input type="number" defaultValue={selectedObject.fontSize} onChange={e => handleFontSizeChange(e.target.value)} className="w-20 bg-gray-700 border border-gray-600 rounded p-1" />
                </div>
            )}
            <div className="flex items-center gap-2">
                <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Save & Finish</button>
                <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
            </div>
        </div>

        {/* Canvas container */}
        <div className="flex-grow w-full h-full flex items-center justify-center overflow-hidden">
            <div className="shadow-2xl">
                <canvas ref={canvasRef} />
            </div>
        </div>
    </div>
  );
};

export default CanvasEditor;
