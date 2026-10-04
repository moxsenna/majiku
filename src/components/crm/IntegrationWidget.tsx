import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Link2, MessageCircle, Package, CreditCard, 
  Mail, Settings, CheckCircle2, XCircle
} from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isConnected: boolean;
  status?: string;
}

const integrations: Integration[] = [
  {
    id: "whatsapp",
    name: "WhatsApp API",
    description: "Kirim pesan otomatis via WhatsApp",
    icon: MessageCircle,
    isConnected: true,
    status: "3 sender aktif",
  },
  {
    id: "shipping",
    name: "Ekspedisi API",
    description: "Lacak status pengiriman otomatis",
    icon: Package,
    isConnected: true,
    status: "JNE, J&T, SiCepat",
  },
  {
    id: "payment",
    name: "Payment Gateway",
    description: "Terima pembayaran online",
    icon: CreditCard,
    isConnected: false,
  },
  {
    id: "email",
    name: "Email Service",
    description: "Kirim email marketing & transaksional",
    icon: Mail,
    isConnected: true,
    status: "SendGrid",
  },
];

export function IntegrationWidget() {
  const { toast } = useToast();

  const handleConnect = (integration: Integration) => {
    toast({
      title: integration.isConnected ? "Disconnected" : "Connecting...",
      description: integration.isConnected 
        ? `${integration.name} telah diputus`
        : `Menghubungkan ke ${integration.name}...`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="w-4 h-4 text-primary" />
          Integrasi Platform
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <div 
              key={integration.id} 
              className={`p-3 rounded-lg border transition-colors ${
                integration.isConnected ? "bg-card" : "bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    integration.isConnected ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      integration.isConnected ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{integration.name}</p>
                      {integration.isConnected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {integration.isConnected && integration.status 
                        ? integration.status 
                        : integration.description}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integration.isConnected ? "outline" : "default"}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleConnect(integration)}
                >
                  {integration.isConnected ? (
                    <Settings className="w-3 h-3" />
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </div>
          );
        })}

        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-center text-muted-foreground">
            💡 Integrasikan dengan berbagai platform untuk otomasi yang lebih powerful
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
