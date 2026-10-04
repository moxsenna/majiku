import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Phone, DollarSign } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  childName: string;
  childAge: number;
  source: string;
  stage: string;
  priority: "high" | "medium" | "low";
  notes: string;
  lastContact: string;
  expectedValue: number;
  avatar?: string;
}

interface LeadPipelineCardProps {
  lead: Lead;
  onClick: () => void;
}

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function LeadPipelineCard({ lead, onClick }: LeadPipelineCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] touch-manipulation"
      onClick={onClick}
    >
      <CardContent className="p-2.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarImage src={lead.avatar} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {lead.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-xs truncate max-w-[100px]">
                {lead.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {lead.childName} ({lead.childAge}th)
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-[9px] shrink-0 px-1.5 ${priorityColors[lead.priority]}`}
          >
            {lead.priority === "high" ? "🔴" : lead.priority === "medium" ? "🟡" : "🟢"}
          </Badge>
        </div>
        
        <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {lead.notes}
        </p>
        
        <div className="flex items-center justify-between text-[10px] gap-1">
          <span className="text-muted-foreground flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {lead.lastContact}
          </span>
          <Badge variant="outline" className="text-[9px] px-1.5">
            {lead.source}
          </Badge>
        </div>
        
        <div className="mt-2 pt-2 border-t">
          <Badge variant="secondary" className="text-[10px] w-full justify-center gap-1">
            <DollarSign className="w-2.5 h-2.5" />
            Rp {(lead.expectedValue / 1000000).toFixed(1)}jt
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
