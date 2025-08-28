'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';

interface BarcodeDisplayProps {
  member: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    barcode: string;
  };
  showPrintButton?: boolean;
}

const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({ member, showPrintButton = true }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Barcode - ${member.first_name} ${member.last_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .barcode-card {
              border: 2px solid #000;
              border-radius: 10px;
              padding: 20px;
              max-width: 400px;
              margin: 0 auto;
              background: white;
            }
            .header {
              margin-bottom: 20px;
            }
            .church-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .member-name {
              font-size: 16px;
              margin-bottom: 5px;
            }
            .member-email {
              font-size: 12px;
              color: #666;
              margin-bottom: 20px;
            }
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 24px;
              font-weight: bold;
              letter-spacing: 2px;
              background: #f8f9fa;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 5px;
              margin: 20px 0;
            }
            .instructions {
              font-size: 10px;
              color: #666;
              margin-top: 20px;
              text-align: left;
            }
            .footer {
              margin-top: 20px;
              font-size: 10px;
              color: #999;
            }
            @media print {
              body { margin: 0; }
              .barcode-card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="barcode-card">
            <div class="header">
              <div class="church-name">Zoe Flock Church</div>
              <div class="member-name">${member.first_name} ${member.last_name}</div>
              <div class="member-email">${member.email}</div>
            </div>
            
            <div class="barcode">${member.barcode}</div>
            
            <div class="instructions">
              <strong>Instructions:</strong><br>
              • Present this card at church events<br>
              • Scan the barcode to mark attendance<br>
              • Keep this card secure and do not share<br>
              • Report lost cards immediately
            </div>
            
            <div class="footer">
              Generated on ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="text-center">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Zoe Flock Church
          </h3>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {member.first_name} {member.last_name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {member.email}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-6">
          <div className="font-mono text-2xl font-bold tracking-widest text-gray-900 dark:text-white">
            {member.barcode}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-left space-y-1 mb-6">
          <p><strong>Instructions:</strong></p>
          <p>• Present this card at church events</p>
          <p>• Scan the barcode to mark attendance</p>
          <p>• Keep this card secure and do not share</p>
          <p>• Report lost cards immediately</p>
        </div>

        {showPrintButton && (
          <Button
            onClick={handlePrint}
            variant="primary"
            className="w-full"
          >
            <i className="fas fa-print mr-2"></i>
            Print Barcode Card
          </Button>
        )}

        <div className="text-xs text-gray-400 dark:text-gray-500 mt-4">
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
};

export default BarcodeDisplay; 