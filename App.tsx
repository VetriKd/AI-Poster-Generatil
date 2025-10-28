import React, { useState } from 'react';
import Header from './components/Header';
import Loader from './components/Loader';
import Tabs from './components/Tabs';
import PosterStudio from './components/PosterStudio';
import ImagenGenerator from './components/ImagenGenerator';
import LiveAgent from './components/LiveAgent';
import ImageAnalyzer from './components/ImageAnalyzer';
import AudioTranscriber from './components/AudioTranscriber';
import DesignReplicator from './components/DesignReplicator';

export type TabValue = 'poster' | 'imagen' | 'live' | 'analyze' | 'transcribe' | 'replicate';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabValue>('poster');
  
  const renderContent = () => {
    switch(activeTab) {
      case 'poster':
        return <PosterStudio setIsLoading={setIsLoading} />;
      case 'imagen':
        return <ImagenGenerator setIsLoading={setIsLoading} />;
      case 'live':
        return <LiveAgent setIsLoading={setIsLoading} />;
      case 'analyze':
        return <ImageAnalyzer setIsLoading={setIsLoading} />;
      case 'transcribe':
        return <AudioTranscriber setIsLoading={setIsLoading} />;
      case 'replicate':
        return <DesignReplicator setIsLoading={setIsLoading} />;
      default:
        return <PosterStudio setIsLoading={setIsLoading} />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans antialiased">
      {isLoading && <Loader />}
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
