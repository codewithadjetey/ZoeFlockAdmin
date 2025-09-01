<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use Dompdf\Dompdf;
use Dompdf\Options;
use Carbon\Carbon;

class ExportService
{
    /**
     * Export report to Excel
     */
    public function exportToExcel($data, $reportType, $startDate, $endDate): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set title
        $title = in_array($reportType, ['summary', 'detailed', 'member_performance']) ? 'TITHE ' . strtoupper($reportType) . ' REPORT' : strtoupper($reportType) . ' REPORT';
        $sheet->setCellValue('A1', $title);
        $sheet->setCellValue('A2', 'Period: ' . $startDate . ' to ' . $endDate);
        $sheet->setCellValue('A3', 'Generated: ' . Carbon::now()->format('Y-m-d H:i:s'));

        // Add data based on report type
        switch ($reportType) {
            case 'income':
                $this->addIncomeDataToExcel($sheet, $data);
                break;
            case 'expenses':
                $this->addExpenseDataToExcel($sheet, $data);
                break;
            case 'comparison':
                $this->addComparisonDataToExcel($sheet, $data);
                break;
            case 'summary':
            case 'detailed':
            case 'member_performance':
                $this->addTitheDataToExcel($sheet, $data, $reportType);
                break;
            default:
                $this->addGeneralDataToExcel($sheet, $data);
        }

        // Auto-size columns
        foreach (range('A', $sheet->getHighestColumn()) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Create filename
        $prefix = in_array($reportType, ['summary', 'detailed', 'member_performance']) ? 'tithe_report' : 'financial_report';
        $filename = "{$prefix}_{$reportType}_{$startDate}_{$endDate}.xlsx";
        $filepath = storage_path("app/public/exports/{$filename}");

        // Ensure directory exists
        Storage::disk('public')->makeDirectory('exports');

        // Save file
        $writer = new Xlsx($spreadsheet);
        $writer->save($filepath);

        return $filename;
    }

    /**
     * Export report to PDF
     */
    public function exportToPdf($data, $reportType, $startDate, $endDate): string
    {
        $dompdf = new Dompdf();
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', true);
        $dompdf->setOptions($options);

        // Generate HTML content
        $html = $this->generatePdfHtml($data, $reportType, $startDate, $endDate);
        $dompdf->loadHtml($html);

        // Set paper size and orientation
        $dompdf->setPaper('A4', 'portrait');

        // Render PDF
        $dompdf->render();

        // Create filename
        $prefix = in_array($reportType, ['summary', 'detailed', 'member_performance']) ? 'tithe_report' : 'financial_report';
        $filename = "{$prefix}_{$reportType}_{$startDate}_{$endDate}.pdf";
        $filepath = storage_path("app/public/exports/{$filename}");

        // Ensure directory exists
        Storage::disk('public')->makeDirectory('exports');

        // Save file
        file_put_contents($filepath, $dompdf->output());

        return $filename;
    }

    /**
     * Export report to CSV
     */
    public function exportToCsv($data, $reportType, $startDate, $endDate): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Add data based on report type
        switch ($reportType) {
            case 'income':
                $this->addIncomeDataToExcel($sheet, $data);
                break;
            case 'expenses':
                $this->addExpenseDataToExcel($sheet, $data);
                break;
            case 'comparison':
                $this->addComparisonDataToExcel($sheet, $data);
                break;
            case 'summary':
            case 'detailed':
            case 'member_performance':
                $this->addTitheDataToExcel($sheet, $data, $reportType);
                break;
            default:
                $this->addGeneralDataToExcel($sheet, $data);
        }

        // Create filename
        $prefix = in_array($reportType, ['summary', 'detailed', 'member_performance']) ? 'tithe_report' : 'financial_report';
        $filename = "{$prefix}_{$reportType}_{$startDate}_{$endDate}.csv";
        $filepath = storage_path("app/public/exports/{$filename}");

        // Ensure directory exists
        Storage::disk('public')->makeDirectory('exports');

        // Save file
        $writer = new Csv($spreadsheet);
        $writer->save($filepath);

        return $filename;
    }

    /**
     * Add income data to Excel sheet
     */
    private function addIncomeDataToExcel($sheet, $data)
    {
        // Summary section
        $sheet->setCellValue('A5', 'SUMMARY');
        $sheet->setCellValue('A6', 'Total Income:');
        $sheet->setCellValue('B6', '$' . number_format($data['totalIncome'], 2));
        $sheet->setCellValue('A7', 'Total Transactions:');
        $sheet->setCellValue('B7', $data['totalTransactions']);
        $sheet->setCellValue('A8', 'Average Amount:');
        $sheet->setCellValue('B8', '$' . number_format($data['averageAmount'], 2));

        // Category breakdown
        $sheet->setCellValue('A10', 'CATEGORY BREAKDOWN');
        $sheet->setCellValue('A11', 'Category');
        $sheet->setCellValue('B11', 'Amount');
        $sheet->setCellValue('C11', 'Count');
        $sheet->setCellValue('D11', 'Average');
        $sheet->setCellValue('E11', 'Trend');

        $row = 12;
        foreach ($data['categoryBreakdown'] as $category) {
            $sheet->setCellValue("A{$row}", $category['category']);
            $sheet->setCellValue("B{$row}", '$' . number_format($category['amount'], 2));
            $sheet->setCellValue("C{$row}", $category['count']);
            $sheet->setCellValue("D{$row}", '$' . number_format($category['avgAmount'], 2));
            $sheet->setCellValue("E{$row}", $category['trend']);
            $row++;
        }

        // Monthly trends
        $sheet->setCellValue("A" . ($row + 2), 'MONTHLY TRENDS');
        $sheet->setCellValue("A" . ($row + 3), 'Month');
        $sheet->setCellValue("B" . ($row + 3), 'Tithes');
        $sheet->setCellValue("C" . ($row + 3), 'Offerings');
        $sheet->setCellValue("D" . ($row + 3), 'Partnerships');
        $sheet->setCellValue("E" . ($row + 3), 'Total');

        $row += 4;
        foreach ($data['monthlyTrends'] as $trend) {
            $sheet->setCellValue("A{$row}", $trend['month']);
            $sheet->setCellValue("B{$row}", '$' . number_format($trend['tithes'], 2));
            $sheet->setCellValue("C{$row}", '$' . number_format($trend['offerings'], 2));
            $sheet->setCellValue("D{$row}", '$' . number_format($trend['partnerships'], 2));
            $sheet->setCellValue("E{$row}", '$' . number_format($trend['total'], 2));
            $row++;
        }
    }

    /**
     * Add expense data to Excel sheet
     */
    private function addExpenseDataToExcel($sheet, $data)
    {
        // Summary section
        $sheet->setCellValue('A5', 'SUMMARY');
        $sheet->setCellValue('A6', 'Total Expenses:');
        $sheet->setCellValue('B6', '$' . number_format($data['totalExpenses'], 2));
        $sheet->setCellValue('A7', 'Total Budget:');
        $sheet->setCellValue('B7', '$' . number_format($data['totalBudget'], 2));
        $sheet->setCellValue('A8', 'Variance:');
        $sheet->setCellValue('B8', '$' . number_format($data['variance'], 2));

        // Category breakdown
        $sheet->setCellValue('A10', 'CATEGORY BREAKDOWN');
        $sheet->setCellValue('A11', 'Category');
        $sheet->setCellValue('B11', 'Amount');
        $sheet->setCellValue('C11', 'Budget');
        $sheet->setCellValue('D11', 'Count');
        $sheet->setCellValue('E11', 'Status');

        $row = 12;
        foreach ($data['categoryBreakdown'] as $category) {
            $sheet->setCellValue("A{$row}", $category['category']);
            $sheet->setCellValue("B{$row}", '$' . number_format($category['amount'], 2));
            $sheet->setCellValue("C{$row}", '$' . number_format($category['budget'], 2));
            $sheet->setCellValue("D{$row}", $category['count']);
            $sheet->setCellValue("E{$row}", ucfirst(str_replace('_', ' ', $category['status'])));
            $row++;
        }
    }

    /**
     * Add comparison data to Excel sheet
     */
    private function addComparisonDataToExcel($sheet, $data)
    {
        // Summary section
        $sheet->setCellValue('A5', 'SUMMARY');
        $sheet->setCellValue('A6', 'Total Income:');
        $sheet->setCellValue('B6', '$' . number_format($data['totalIncome'], 2));
        $sheet->setCellValue('A7', 'Total Expenses:');
        $sheet->setCellValue('B7', '$' . number_format($data['totalExpenses'], 2));
        $sheet->setCellValue('A8', 'Net Profit:');
        $sheet->setCellValue('B8', '$' . number_format($data['netProfit'], 2));
        $sheet->setCellValue('A9', 'Profit Margin:');
        $sheet->setCellValue('B9', number_format($data['profitMargin'], 1) . '%');

        // Monthly comparison
        $sheet->setCellValue('A11', 'MONTHLY COMPARISON');
        $sheet->setCellValue('A12', 'Month');
        $sheet->setCellValue('B12', 'Income');
        $sheet->setCellValue('C12', 'Expenses');
        $sheet->setCellValue('D12', 'Profit');
        $sheet->setCellValue('E12', 'Margin');

        $row = 13;
        foreach ($data['monthlyComparison'] as $comparison) {
            $sheet->setCellValue("A{$row}", $comparison['month']);
            $sheet->setCellValue("B{$row}", '$' . number_format($comparison['income'], 2));
            $sheet->setCellValue("C{$row}", '$' . number_format($comparison['expenses'], 2));
            $sheet->setCellValue("D{$row}", '$' . number_format($comparison['profit'], 2));
            $sheet->setCellValue("E{$row}", number_format($comparison['profitMargin'], 1) . '%');
            $row++;
        }
    }

    /**
     * Add general data to Excel sheet
     */
    private function addGeneralDataToExcel($sheet, $data)
    {
        $sheet->setCellValue('A5', 'DATA');
        $sheet->setCellValue('A6', 'This report contains general financial data.');
        
        // Add any data as key-value pairs
        $row = 8;
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sheet->setCellValue("A{$row}", $key . ':');
                $row++;
                foreach ($value as $subKey => $subValue) {
                    $sheet->setCellValue("A{$row}", "  {$subKey}: {$subValue}");
                    $row++;
                }
            } else {
                $sheet->setCellValue("A{$row}", $key . ': ' . $value);
                $row++;
            }
        }
    }

    /**
     * Generate HTML for PDF
     */
    private function generatePdfHtml($data, $reportType, $startDate, $endDate): string
    {
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>' . (in_array($reportType, ['summary', 'detailed', 'member_performance']) ? 'Tithe ' . ucfirst($reportType) : ucfirst($reportType)) . ' Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .subtitle { font-size: 14px; color: #666; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #333; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .summary { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
                .summary-item { margin-bottom: 10px; }
                .label { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">' . (in_array($reportType, ['summary', 'detailed', 'member_performance']) ? 'TITHE ' . strtoupper($reportType) : strtoupper($reportType)) . ' REPORT</div>
                <div class="subtitle">Period: ' . $startDate . ' to ' . $endDate . '</div>
                <div class="subtitle">Generated: ' . Carbon::now()->format('Y-m-d H:i:s') . '</div>
            </div>';

        // Add content based on report type
        switch ($reportType) {
            case 'income':
                $html .= $this->generateIncomePdfContent($data);
                break;
            case 'expenses':
                $html .= $this->generateExpensePdfContent($data);
                break;
            case 'comparison':
                $html .= $this->generateComparisonPdfContent($data);
                break;
            case 'summary':
            case 'detailed':
            case 'member_performance':
                $html .= $this->generateTithePdfContent($data, $reportType);
                break;
            default:
                $html .= $this->generateGeneralPdfContent($data);
        }

        $html .= '</body></html>';

        return $html;
    }

    /**
     * Generate income PDF content
     */
    private function generateIncomePdfContent($data): string
    {
        $html = '
        <div class="section">
            <div class="section-title">Summary</div>
            <div class="summary">
                <div class="summary-item">
                    <span class="label">Total Income:</span> $' . number_format($data['totalIncome'], 2) . '
                </div>
                <div class="summary-item">
                    <span class="label">Total Transactions:</span> ' . $data['totalTransactions'] . '
                </div>
                <div class="summary-item">
                    <span class="label">Average Amount:</span> $' . number_format($data['averageAmount'], 2) . '
                </div>
            </div>
        </div>';

        // Category breakdown table
        $html .= '
        <div class="section">
            <div class="section-title">Category Breakdown</div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Count</th>
                        <th>Average</th>
                        <th>Trend</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($data['categoryBreakdown'] as $category) {
            $html .= '
                    <tr>
                        <td>' . $category['category'] . '</td>
                        <td>$' . number_format($category['amount'], 2) . '</td>
                        <td>' . $category['count'] . '</td>
                        <td>$' . number_format($category['avgAmount'], 2) . '</td>
                        <td>' . $category['trend'] . '</td>
                    </tr>';
        }

        $html .= '</tbody></table></div>';

        return $html;
    }

    /**
     * Generate expense PDF content
     */
    private function generateExpensePdfContent($data): string
    {
        $html = '
        <div class="section">
            <div class="section-title">Summary</div>
            <div class="summary">
                <div class="summary-item">
                    <span class="label">Total Expenses:</span> $' . number_format($data['totalExpenses'], 2) . '
                </div>
                <div class="summary-item">
                    <span class="label">Total Budget:</span> $' . number_format($data['totalBudget'], 2) . '
                </div>
                <div class="summary-item">
                    <span class="label">Variance:</span> $' . number_format($data['variance'], 2) . '
                </div>
            </div>
        </div>';

        // Category breakdown table
        $html .= '
        <div class="section">
            <div class="section-title">Category Breakdown</div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Budget</th>
                        <th>Count</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($data['categoryBreakdown'] as $category) {
            $html .= '
                    <tr>
                        <td>' . $category['category'] . '</td>
                        <td>$' . number_format($category['amount'], 2) . '</td>
                        <td>$' . number_format($category['budget'], 2) . '</td>
                        <td>' . $category['count'] . '</td>
                        <td>' . ucfirst(str_replace('_', ' ', $category['status'])) . '</td>
                    </tr>';
        }

        $html .= '</tbody></table></div>';

        return $html;
    }

    /**
     * Generate comparison PDF content
     */
    private function generateComparisonPdfContent($data): string
    {
        $html = '
        <div class="section">
            <div class="section-title">Summary</div>
            <div class="summary">
                <div class="summary-item">
                    <span class="label">Total Income:</span> $' . number_format($data['totalIncome'], 2) . '
                </div>
                <div class="summary-item">
                    <span class="label">Total Expenses:</span> $' . number_format($data['totalExpenses'], 2) . '
                </div>
                <div class="summary-item">
                    <span class="label">Net Profit:</span> $' . number_format($data['netProfit'], 2) . '
                </div>
                <div class="summary-item">
                    <span class="label">Profit Margin:</span> ' . number_format($data['profitMargin'], 1) . '%
                </div>
            </div>
        </div>';

        // Monthly comparison table
        $html .= '
        <div class="section">
            <div class="section-title">Monthly Comparison</div>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Income</th>
                        <th>Expenses</th>
                        <th>Profit</th>
                        <th>Margin</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($data['monthlyComparison'] as $comparison) {
            $html .= '
                    <tr>
                        <td>' . $comparison['month'] . '</td>
                        <td>$' . number_format($comparison['income'], 2) . '</td>
                        <td>$' . number_format($comparison['expenses'], 2) . '</td>
                        <td>$' . number_format($comparison['profit'], 2) . '</td>
                        <td>' . number_format($comparison['profitMargin'], 1) . '%</td>
                    </tr>';
        }

        $html .= '</tbody></table></div>';

        return $html;
    }

    /**
     * Generate general PDF content
     */
    private function generateGeneralPdfContent($data): string
    {
        $html = '
        <div class="section">
            <div class="section-title">Report Data</div>
            <div class="summary">';

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $html .= '<div class="summary-item"><span class="label">' . $key . ':</span></div>';
                foreach ($value as $subKey => $subValue) {
                    $html .= '<div class="summary-item" style="margin-left: 20px;">' . $subKey . ': ' . $subValue . '</div>';
                }
            } else {
                $html .= '<div class="summary-item"><span class="label">' . $key . ':</span> ' . $value . '</div>';
            }
        }

        $html .= '</div></div>';

        return $html;
    }

    /**
     * Add tithe data to Excel sheet
     */
    private function addTitheDataToExcel($sheet, $data, $reportType): void
    {
        $row = 5; // Start after title and metadata

        switch ($reportType) {
            case 'summary':
                // Add summary data
                $sheet->setCellValue("A{$row}", 'Metric');
                $sheet->setCellValue("B{$row}", 'Value');
                $row++;

                foreach ($data['data'] as $item) {
                    $sheet->setCellValue("A{$row}", $item[0]);
                    $sheet->setCellValue("B{$row}", $item[1]);
                    $row++;
                }
                break;

            case 'detailed':
                // Add detailed tithe data
                $sheet->setCellValue("A{$row}", 'Member');
                $sheet->setCellValue("B{$row}", 'Amount');
                $sheet->setCellValue("C{$row}", 'Frequency');
                $sheet->setCellValue("D{$row}", 'Start Date');
                $sheet->setCellValue("E{$row}", 'Status');
                $sheet->setCellValue("F{$row}", 'Paid Amount');
                $sheet->setCellValue("G{$row}", 'Outstanding');
                $sheet->setCellValue("H{$row}", 'Created By');
                $sheet->setCellValue("I{$row}", 'Created Date');
                $row++;

                foreach ($data['data'] as $item) {
                    $sheet->setCellValue("A{$row}", $item[0]);
                    $sheet->setCellValue("B{$row}", $item[1]);
                    $sheet->setCellValue("C{$row}", $item[2]);
                    $sheet->setCellValue("D{$row}", $item[3]);
                    $sheet->setCellValue("E{$row}", $item[4]);
                    $sheet->setCellValue("F{$row}", $item[5]);
                    $sheet->setCellValue("G{$row}", $item[6]);
                    $sheet->setCellValue("H{$row}", $item[7]);
                    $sheet->setCellValue("I{$row}", $item[8]);
                    $row++;
                }
                break;

            case 'member_performance':
                // Add member performance data
                $sheet->setCellValue("A{$row}", 'Member');
                $sheet->setCellValue("B{$row}", 'Total Tithes');
                $sheet->setCellValue("C{$row}", 'Total Amount');
                $sheet->setCellValue("D{$row}", 'Total Paid');
                $sheet->setCellValue("E{$row}", 'Total Outstanding');
                $sheet->setCellValue("F{$row}", 'Payment Rate');
                $row++;

                foreach ($data['data'] as $item) {
                    $sheet->setCellValue("A{$row}", $item[0]);
                    $sheet->setCellValue("B{$row}", $item[1]);
                    $sheet->setCellValue("C{$row}", $item[2]);
                    $sheet->setCellValue("D{$row}", $item[3]);
                    $sheet->setCellValue("E{$row}", $item[4]);
                    $sheet->setCellValue("F{$row}", $item[5]);
                    $row++;
                }
                break;
        }
    }

    /**
     * Generate tithe PDF content
     */
    private function generateTithePdfContent($data, $reportType): string
    {
        $html = '';

        switch ($reportType) {
            case 'summary':
                $html .= '
                <div class="section">
                    <div class="section-title">Tithe Summary</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>';

                foreach ($data['data'] as $item) {
                    $html .= '
                            <tr>
                                <td>' . $item[0] . '</td>
                                <td>' . $item[1] . '</td>
                            </tr>';
                }

                $html .= '</tbody></table></div>';
                break;

            case 'detailed':
                $html .= '
                <div class="section">
                    <div class="section-title">Detailed Tithe Report</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Amount</th>
                                <th>Frequency</th>
                                <th>Start Date</th>
                                <th>Status</th>
                                <th>Paid Amount</th>
                                <th>Outstanding</th>
                                <th>Created By</th>
                                <th>Created Date</th>
                            </tr>
                        </thead>
                        <tbody>';

                foreach ($data['data'] as $item) {
                    $html .= '
                            <tr>
                                <td>' . $item[0] . '</td>
                                <td>' . $item[1] . '</td>
                                <td>' . $item[2] . '</td>
                                <td>' . $item[3] . '</td>
                                <td>' . $item[4] . '</td>
                                <td>' . $item[5] . '</td>
                                <td>' . $item[6] . '</td>
                                <td>' . $item[7] . '</td>
                                <td>' . $item[8] . '</td>
                            </tr>';
                }

                $html .= '</tbody></table></div>';
                break;

            case 'member_performance':
                $html .= '
                <div class="section">
                    <div class="section-title">Member Performance Report</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Total Tithes</th>
                                <th>Total Amount</th>
                                <th>Total Paid</th>
                                <th>Total Outstanding</th>
                                <th>Payment Rate</th>
                            </tr>
                        </thead>
                        <tbody>';

                foreach ($data['data'] as $item) {
                    $html .= '
                            <tr>
                                <td>' . $item[0] . '</td>
                                <td>' . $item[1] . '</td>
                                <td>' . $item[2] . '</td>
                                <td>' . $item[3] . '</td>
                                <td>' . $item[4] . '</td>
                                <td>' . $item[5] . '</td>
                            </tr>';
                }

                $html .= '</tbody></table></div>';
                break;
        }

        return $html;
    }
} 