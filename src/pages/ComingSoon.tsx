import { useNavigate } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <PackageOpen className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Coming soon</h2>
        <p className="text-sm text-slate-500 mb-6">
          This module is being built in the next development phase.
        </p>
        <Button onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
      </Card>
    </div>
  );
}
