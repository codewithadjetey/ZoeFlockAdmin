'use client';

import React from 'react';
import { Button, Card } from '@/components/ui';
import type { Member } from '@/services/members';

interface MemberIdCardProps {
  member: Member;
  showPrintButton?: boolean;
}

const MemberIdCard: React.FC<MemberIdCardProps> = ({ member, showPrintButton = true }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Member ID Card - ${member.first_name} ${member.last_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .id-card {
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
              color: #1f2937;
            }
            .member-name {
              font-size: 16px;
              margin-bottom: 5px;
              font-weight: 600;
            }
            .member-info {
              font-size: 12px;
              color: #666;
              margin-bottom: 20px;
            }
            .member-id {
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
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 1px;
              background: #f8f9fa;
              padding: 10px;
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
              .id-card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="id-card">
            <div class="header">
              <div class="church-name">Zoe Flock Church</div>
              <div class="member-name">${member.first_name} ${member.last_name}</div>
              <div class="member-info">
                ${member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : ''}
                ${member.membership_date ? '• Member since ' + new Date(member.membership_date).getFullYear() : ''}
              </div>
            </div>
            
            <div class="member-id">${member.member_identification_id}</div>
            
            <div class="barcode">${member.member_identification_id}</div>
            
            <div class="instructions">
              <strong>Instructions:</strong><br>
              • Present this card at church events<br>
              • Scan the member ID to mark attendance<br>
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
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Member ID Card</h3>
        {showPrintButton && (
          <Button onClick={handlePrint} variant="outline" size="sm">
            <i className="fas fa-print mr-2"></i>
            Print Card
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Member Photo Placeholder */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            {member.profile_image_path ? (
              <img 
                src={member.profile_image_path} 
                alt={`${member.first_name} ${member.last_name}`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <i className="fas fa-user text-gray-400 text-2xl"></i>
            )}
          </div>
        </div>

        {/* Member Information */}
        <div className="text-center">
          <h4 className="text-xl font-semibold text-gray-900">
            {member.first_name} {member.last_name}
          </h4>
          <p className="text-gray-600">{member.email}</p>
          {member.phone && (
            <p className="text-sm text-gray-500">{member.phone}</p>
          )}
        </div>

        {/* Member ID Display */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Member Identification ID
          </label>
          <div className="font-mono text-2xl font-bold text-gray-900 tracking-wider">
            {member.member_identification_id}
          </div>
        </div>

        {/* Barcode Representation */}
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Barcode (for scanning)
          </label>
          <div className="font-mono text-lg font-bold text-gray-900 tracking-wider bg-white p-3 rounded border">
            {member.member_identification_id}
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Gender:</span>
            <p className="font-medium capitalize">
              {member.gender || 'Not specified'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Member Since:</span>
            <p className="font-medium">
              {member.membership_date ? 
                new Date(member.membership_date).getFullYear() : 
                'Not specified'
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MemberIdCard; 