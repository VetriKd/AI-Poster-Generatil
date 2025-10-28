import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import PosterStudio from './components/PosterStudio';
import ImagenGenerator from './components/ImagenGenerator';
import Loader from './components/Loader';
import DesignReplicator from './components/DesignReplicator';
import BrandKitSetup from './components/BrandKitSetup';

const TABS = ['Poster Studio', 'Imagen Generator', 'Design Replicator'];

export interface BrandKitData {
  logoFile: File | null;
  contactNumber: string;
  socialMedia: string;
}

function App() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKitData | null>(null);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Poster Studio':
        return <PosterStudio setIsLoading={setIsLoading} brandKit={brandKit} />;
      case 'Imagen Generator':
        return <ImagenGenerator setIsLoading={setIsLoading} />;
      case 'Design Replicator':
        return <DesignReplicator setIsLoading={setIsLoading} />;
      default:
        return null;
    }
  };

  const handleSaveBrandKit = (data: BrandKitData) => {
    setBrandKit(data);
    setIsBrandKitOpen(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {isLoading && <Loader />}
      {isBrandKitOpen && (
        <BrandKitSetup 
          onClose={() => setIsBrandKitOpen(false)} 
          onSave={handleSaveBrandKit}
          currentBrandKit={brandKit}
        />
      )}
      <Header onSetupBrandKit={() => setIsBrandKitOpen(true)} />
      <main className="container mx-auto px-4 pb-16">
        <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}

export default App;