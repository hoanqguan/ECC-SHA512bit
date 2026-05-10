import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Trash2, Key, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { toast } from "sonner";

export default function KeyCard({ keyPair, onDelete, onSelect, isSelected }) {
  const [expanded, setExpanded] = useState(false);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? "border-primary shadow-lg"
          : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
      onClick={() => onSelect(keyPair)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{keyPair.name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(keyPair.created_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs font-mono">
              <Shield className="w-3 h-3 mr-1" />
              {keyPair.curve || "brainpoolP512r1"}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(keyPair.id); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        {keyPair.fingerprint && (
          <p className="text-xs text-muted-foreground font-mono truncate mt-1">
            FP: {keyPair.fingerprint.slice(0, 47)}…
          </p>
        )}
        {keyPair.notes && (
          <p className="text-xs text-muted-foreground italic">{keyPair.notes}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs h-7"
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        >
          {expanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
          {expanded ? "Hide keys" : "Show keys"}
        </Button>

        {expanded && (
          <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-muted-foreground">PUBLIC KEY</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copy(keyPair.public_key_pem, "Public key")}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Textarea value={keyPair.public_key_pem} readOnly className="text-xs font-mono h-20 resize-none bg-muted/50" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-muted-foreground">PRIVATE KEY</span>
                <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copy(keyPair.private_key_pem, "Private key")}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <Textarea value={keyPair.private_key_pem} readOnly className="text-xs font-mono h-20 resize-none bg-muted/50" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}