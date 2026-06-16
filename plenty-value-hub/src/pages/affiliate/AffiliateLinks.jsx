import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNGN } from '@/lib/currency';
import { Copy, Check, ExternalLink, Link2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AffiliateLinks() {
  const [user, setUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: links = [] } = useQuery({
    queryKey: ['affiliate-links', user?.id],
    queryFn: () => base44.entities.AffiliateLink.filter({ affiliate_id: user.id }, '-created_date', 100),
    enabled: !!user,
  });

  const handleCopy = (link) => {
    const url = `${window.location.origin}/ref/${link.link_code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Affiliate link copied!');
  };

  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const totalConversions = links.reduce((sum, l) => sum + (l.conversions || 0), 0);
  const totalEarned = links.reduce((sum, l) => sum + (l.commission_earned || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="w-6 h-6 text-[#715AFF]" />
            My Affiliate Links
          </h1>
          <p className="text-muted-foreground text-sm">Manage and share your tracking links</p>
        </div>
        <Link to="/affiliate/products">
          <Button style={{ backgroundColor: '#81C14B' }} className="text-white hover:opacity-90">
            + Get New Link
          </Button>
        </Link>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Clicks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalConversions}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Conversions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatNGN(totalEarned)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Earned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {links.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Tracking Link</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conv.</TableHead>
                  <TableHead>Revenue (₦)</TableHead>
                  <TableHead>Earned (₦)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Copy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map(link => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium max-w-[120px] truncate">{link.product_name}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        /ref/{link.link_code}
                      </span>
                    </TableCell>
                    <TableCell>{link.clicks || 0}</TableCell>
                    <TableCell>{link.conversions || 0}</TableCell>
                    <TableCell>{formatNGN(link.revenue)}</TableCell>
                    <TableCell className="text-green-600 font-semibold">{formatNGN(link.commission_earned)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${link.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {link.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(link)}>
                        {copiedId === link.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <Link2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">No affiliate links yet.</p>
              <Link to="/affiliate/products">
                <Button style={{ backgroundColor: '#81C14B' }} className="text-white">Browse Products to Promote</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}