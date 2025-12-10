
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import logger from '../utils/logger.js';

class ReportsService {
    /**
     * Gera um arquivo Excel (.xlsx) com a lista de feedbacks
     * @param {Array} feedbacks 
     * @returns {Promise<Buffer>}
     */
    async generateExcel(feedbacks) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Feedbacks');

            // Definir colunas
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Data', key: 'data_envio', width: 20 },
                { header: 'Formulário', key: 'form_nome', width: 20 },
                { header: 'Modo', key: 'modo', width: 15 },
                { header: 'Cliente', key: 'cliente', width: 20 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Estrelas', key: 'opinstars', width: 10 },
                { header: 'Comentário', key: 'comentario', width: 50 },
                { header: 'Sentimento (IA)', key: 'sentimento_ia', width: 15 },
                { header: 'Moderação', key: 'status_moderacao', width: 15 },
                { header: 'Resumo (IA)', key: 'resumo_ia', width: 40 }
            ];

            // Adicionar linhas
            feedbacks.forEach(f => {
                const iaData = f.resultado_ia_json || {};

                worksheet.addRow({
                    id: f.id,
                    data_envio: f.data_envio ? new Date(f.data_envio).toLocaleString('pt-BR') : '-',
                    form_nome: f.forms?.nome || 'N/A',
                    modo: f.modo,
                    cliente: f.nome_cliente || 'Anônimo',
                    email: f.email_cliente || '-',
                    opinstars: f.opinstars,
                    comentario: f.comentario_texto || '-',
                    sentimento_ia: iaData.sentimento || '-',
                    status_moderacao: f.status_moderacao,
                    resumo_ia: iaData.resumo || '-'
                });
            });

            // Estilizar cabeçalho
            worksheet.getRow(1).font = { bold: true };

            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            logger.error('Erro ao gerar Excel:', error);
            throw new Error('Falha na geração do Excel');
        }
    }

    /**
     * Gera um relatório PDF executivo
     * @param {Array} feedbacks 
     * @param {Object} stats
     * @returns {Promise<Buffer>}
     */
    async generatePDF(feedbacks, stats) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const buffers = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // ==========================
                // CABEÇALHO
                // ==========================
                doc.fontSize(20).text('Relatório Executivo - OpinApp', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center', color: 'gray' });
                doc.moveDown(2);

                // ==========================
                // RESUMO GERAL
                // ==========================
                doc.fontSize(16).text('Resumo Geral', { underline: true });
                doc.moveDown(0.5);

                doc.fontSize(12).text(`Total de Feedbacks: ${stats.totalFeedbacks}`);
                doc.text(`Avaliação Média: ${stats.averageOpinStars} / 5.0`);
                doc.moveDown();

                // ==========================
                // SENTIMENTO
                // ==========================
                doc.fontSize(16).text('Análise de Sentimento', { underline: true });
                doc.moveDown(0.5);

                const sentiment = stats.sentimentDistribution;
                doc.fontSize(12);
                doc.text(`😊 Positivos: ${sentiment.positive} (${sentiment.positivePercentage}%)`);
                doc.text(`😐 Neutros: ${sentiment.neutral}`); // TODO: Calcular % se necessário
                doc.text(`😞 Negativos: ${sentiment.negative} (${sentiment.negativePercentage}%)`);
                doc.moveDown(2);

                // ==========================
                // FEEDBACKS RECENTES (TOP 10)
                // ==========================
                doc.fontSize(16).text('Últimos Feedbacks (Top 10)', { underline: true });
                doc.moveDown();

                feedbacks.slice(0, 10).forEach((f, index) => {
                    doc.fontSize(10).font('Helvetica-Bold').text(`Feedback #${f.id} - ${f.data_envio ? new Date(f.data_envio).toLocaleDateString() : ''}`);
                    doc.font('Helvetica').text(`Nota: ${f.opinstars} estrelas`);

                    if (f.comentario_texto) {
                        doc.text(`Comentário: "${f.comentario_texto}"`);
                    }

                    const ia = f.resultado_ia_json || {};
                    if (ia.sentimento) {
                        doc.fillColor('gray').text(`IA: Sentimento ${ia.sentimento} | Temas: ${(ia.temas || []).join(', ')}`);
                        doc.fillColor('black');
                    }

                    doc.moveDown(0.5);
                    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#eeeeee').stroke();
                    doc.moveDown(0.5);
                });

                // Finalizar PDF
                doc.end();

            } catch (error) {
                logger.error('Erro ao gerar PDF:', error);
                reject(error);
            }
        });
    }
}

export default new ReportsService();
