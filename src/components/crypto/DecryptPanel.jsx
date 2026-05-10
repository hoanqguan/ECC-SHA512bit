import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Unlock, Copy, CheckCircle2 } from "lucide-react";
import { decrypt } from "@/lib/brainpool";
import { toast } from "sonner";

export default function DecryptPanel({ selectedKey }) {
  const [ciphertext, setCiphertext] = useState("");
  const [plaintext, setPlaintext] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDecrypt = async () => {
    if (!ciphertext.trim()) { toast.error("Enter ciphertext to decrypt"); return; }
    if (!selectedKey) { toast.error("Select a key pair first"); return; }
    setLoading(true);
    const result = await decrypt(ciphertext.trim(), selectedKey.private_key_pem);
    setPlaintext(result);
    setLoading(false);
    toast.success("Message decrypted successfully");
  };

  const copyPlaintext = () => {
    navigator.clipboard.writeText(plaintext);
    toast.success("Plaintext copied");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Unlock className="w-4 h-4" />
          Decrypt Message
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
          <Label className="text-xs font-medium">Ciphertext (base64)</Label>
          <Textarea
            placeholder="Paste the base64 ciphertext here..."
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            className="mt-1 h-24 resize-none font-mono text-xs"
          />
        </div>

        <Button onClick={handleDecrypt} disabled={loading || !selectedKey} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Unlock className="w-4 h-4 mr-2" />}
          Decrypt (ECIES)
        </Button>

        {plaintext && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs font-medium text-muted-foreground">PLAINTEXT</Label>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyPlaintext}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Textarea
              value={plaintext}
              readOnly
              className="text-xs font-mono h-24 resize-none bg-muted/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}