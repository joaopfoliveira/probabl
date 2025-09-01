/**
 * Terms of Service page
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Its Probabl',
  description: 'Our terms of service outline the rules and regulations for using our betting tips platform.',
  openGraph: {
    title: 'Terms of Service | Its Probabl',
    description: 'Our terms of service outline the rules and regulations for using our betting tips platform.',
  },
};

export default function TermsPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Terms of Service</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms 
              and provision of this agreement. These terms apply to all visitors, users and others 
              who access or use the service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimer of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>IMPORTANT NOTICE:</strong> All betting tips and predictions provided on this website 
              are for informational and entertainment purposes only.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not guarantee the accuracy of any predictions</li>
              <li>Past results do not guarantee future performance</li>
              <li>Betting involves risk and you may lose money</li>
              <li>Never bet more than you can afford to lose</li>
            </ul>
            <p>
              You are solely responsible for any betting decisions you make based on our content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsible Gambling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We promote responsible gambling and encourage users to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Set limits on time and money spent on betting</li>
              <li>Never chase losses</li>
              <li>Seek help if gambling becomes a problem</li>
              <li>Ensure they are of legal age to gamble in their jurisdiction</li>
            </ul>
            <p>
              If you or someone you know has a gambling problem, please contact:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>National Council on Problem Gambling: 1-800-522-4700</li>
              <li>Gamblers Anonymous: www.gamblersanonymous.org</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Permission is granted to temporarily download one copy of the materials on our website 
              for personal, non-commercial transitory viewing only.
            </p>
            <p>Under this license you may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for commercial purposes</li>
              <li>Attempt to reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the Site, to understand our practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We may revise these terms of service at any time without notice. By using this website, 
              you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@betting-tips-ai.com" className="text-primary hover:underline">
                legal@betting-tips-ai.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}