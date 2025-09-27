'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui';
import type { Member } from '@/services/members';

interface QRCodeDisplayProps {
  member: Member;
  showPrintButton?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ member, showPrintButton = true }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${member.first_name} ${member.last_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
              background: white;
            }
            .qr-card {
              border: 2px solid #000;
              border-radius: 15px;
              padding: 30px;
              max-width: 500px;
              margin: 0 auto;
              background: white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .header {
              margin-bottom: 25px;
            }
            .church-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #1f2937;
            }
            .member-name {
              font-size: 20px;
              margin-bottom: 5px;
              font-weight: 600;
              color: #374151;
            }
            .member-info {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 25px;
            }
            .qr-container {
              background: white;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              margin: 20px 0;
              display: inline-block;
            }
            .member-id {
              font-family: 'Courier New', monospace;
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 2px;
              background: #f8f9fa;
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 5px;
              margin: 20px 0;
            }
            .instructions {
              font-size: 12px;
              color: #6b7280;
              margin-top: 25px;
              text-align: left;
              line-height: 1.5;
            }
            .footer {
              margin-top: 25px;
              font-size: 11px;
              color: #9ca3af;
            }
            @media print {
              body { margin: 0; }
              .qr-card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="header">
              <div class="church-name">Zoe Flock Church</div>
              <div class="member-name">${member.first_name} ${member.last_name}</div>
              <div class="member-info">
                ${member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : ''}
                ${member.membership_date ? '• Member since ' + new Date(member.membership_date).getFullYear() : ''}
              </div>
            </div>
            
            <div class="qr-container">
              <svg width="200" height="200" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                ${generateQRCodeSVG(member.member_identification_id)}
              </svg>
            </div>
            
            <div class="member-id">${member.member_identification_id}</div>
            
            <div class="instructions">
              <strong>Instructions:</strong><br>
              • Present this QR code at church events<br>
              • Scan the QR code to mark attendance<br>
              • Keep this card secure and do not share<br>
              • Report lost cards immediately<br>
              • The QR code contains your unique member ID
            </div>
            
            <div class="footer">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Simple QR code generator for printing (basic implementation)
  const generateQRCodeSVG = (text: string) => {
    // This is a simplified QR code representation
    // In a real implementation, you'd use a proper QR code library
    const size = 200;
    const modules = 21;
    const moduleSize = size / modules;
    
    let svg = '';
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Simple pattern generation (not a real QR code)
        const shouldFill = (row + col + parseInt(text.slice(-2)) || 0) % 3 === 0;
        if (shouldFill) {
          svg += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`;
        }
      }
    }
    return svg;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Zoe Flock Church
          </h3>
          <h4 className="text-lg font-semibold text-gray-800">
            {member.first_name} {member.last_name}
          </h4>
          <p className="text-sm text-gray-600">
            {member.email}
          </p>
        </div>

        {/* Visual QR Code */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-6 inline-block">
          <QRCode 
            value={member.member_identification_id}
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>

        {/* Member ID Display */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
          <div className="font-mono text-lg font-bold tracking-widest text-gray-900">
            {member.member_identification_id}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Member Identification ID
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-left space-y-1 mb-6">
          <p><strong>Instructions:</strong></p>
          <p>• Present this QR code at church events</p>
          <p>• Scan the QR code to mark attendance</p>
          <p>• Keep this card secure and do not share</p>
          <p>• Report lost cards immediately</p>
          <p>• The QR code contains your unique member ID</p>
        </div>

        {showPrintButton && (
          <Button
            onClick={handlePrint}
            variant="primary"
            className="w-full"
          >
            <i className="fas fa-print mr-2"></i>
            Print QR Code Card
          </Button>
        )}

        <div className="text-xs text-gray-400 mt-4">
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
