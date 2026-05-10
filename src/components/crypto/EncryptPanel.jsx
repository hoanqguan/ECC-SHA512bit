import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Copy, CheckCircle2 } from "lucide-react";
import { encrypt } from "@/lib/brainpool";
import { toast } from "sonner";

export default function EncryptPanel({ selectedKey }) {
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEncrypt = async () => {
    if (!plaintext.trim()) { toast.error("Enter a message to encrypt"); return; }
    if (!selectedKey) { toast.error("Select a key pair first"); return; }
    setLoading(true);
    const result = await encrypt(plaintext, selectedKey.public_key_pem);
    setCiphertext(result);
    setLoading(false);
    toast.success("Message encrypted successfully");
  };

  const copyCiphertext = () => {
    navigator.clipboard.writeText(ciphertext);
    toast.success("Ciphertext copied");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Encrypt Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedKey ? (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{selectedKey.name}</span>
            <Badge variant="outline" className="text-xs ml-auto">Active Key</Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">← Select a key pair from the list</p>
        )}

        <div>
          <Label className="text-xs font-medium">Plaintext</Label>
          <Textarea
            placeholder="Enter the message to encrypt..."
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="mt-1 h-28 resize-none font-mono text-sm"
          />
        </div>

        <Button onClick={handleEncrypt} disabled={loading || !selectedKey} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
          Encrypt (ECIES)
        </Button>

        {ciphertext && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs font-medium text-muted-foreground">CIPHERTEXT (base64)</Label>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyCiphertext}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Textarea
              value={ciphertext}
              readOnly
              className="text-xs font-mono h-24 resize-none bg-muted/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}