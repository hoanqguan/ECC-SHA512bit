import { useState, useEffect } from "react";
import { KeyStore } from "@/lib/localKeyStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import KeyCard from "@/components/crypto/KeyCard";
import GenerateKeyModal from "@/components/crypto/GenerateKeyModal";
import SignPanel from "@/components/crypto/SignPanel";
import VerifyPanel from "@/components/crypto/VerifyPanel";
import EncryptPanel from "@/components/crypto/EncryptPanel";
import DecryptPanel from "@/components/crypto/DecryptPanel";
import { toast } from "sonner";

export default function CryptoToolkit() {
  const [keyPairs, setKeyPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);

  const loadKeys = () => {
    setLoading(true);
    const keys = KeyStore.list("-created_date");
    setKeyPairs(keys);
    setLoading(false);
  };

  useEffect(() => { loadKeys(); }, []);

  const handleDelete = async (id) => {
    KeyStore.delete(id);
    if (selectedKey?.id === id) setSelectedKey(null);
    setKeyPairs((prev) => prev.filter((k) => k.id !== id));
    toast.success("Key pair deleted");
  };

  const handleSelect = (key) => {
    setSelectedKey((prev) => prev?.id === key.id ? null : key);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">ECC Crypto Toolkit</h1>
              <p className="text-xs text-muted-foreground">Brainpool P-512 · ECDSA · SHA-512</p>
            </div>
          </div>
          <Button onClick={() => setShowGenerate(true)} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Key Pair
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key list */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Saved Key Pairs
              </h2>
              <span className="ml-auto text-xs text-muted-foreground">{keyPairs.length}</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : keyPairs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No key pairs yet</p>
                <Button variant="link" size="sm" onClick={() => setShowGenerate(true)}>
                  Generate your first key
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {keyPairs.map((kp) => (
                  <KeyCard
                    key={kp.id}
                    keyPair={kp}
                    onDelete={handleDelete}
                    onSelect={handleSelect}
                    isSelected={selectedKey?.id === kp.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Operations */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="sign">
              <TabsList className="mb-4 w-full sm:w-auto">
                <TabsTrigger value="sign" className="flex-1 sm:flex-none">Sign</TabsTrigger>
                <TabsTrigger value="verify" className="flex-1 sm:flex-none">Verify</TabsTrigger>
                <TabsTrigger value="encrypt" className="flex-1 sm:flex-none">Encrypt</TabsTrigger>
                <TabsTrigger value="decrypt" className="flex-1 sm:flex-none">Decrypt</TabsTrigger>
              </TabsList>
              <TabsContent value="sign">
                <SignPanel selectedKey={selectedKey} />
              </TabsContent>
              <TabsContent value="verify">
                <VerifyPanel selectedKey={selectedKey} />
              </TabsContent>
              <TabsContent value="encrypt">
                <EncryptPanel selectedKey={selectedKey} />
              </TabsContent>
              <TabsContent value="decrypt">
                <DecryptPanel selectedKey={selectedKey} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <GenerateKeyModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onGenerated={loadKeys}
      />
    </div>
  );
}