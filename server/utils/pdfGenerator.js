const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Função para gerar PDF de relatório de blitz
const generateBlitzReport = (blitz, abordagens) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Cabeçalho
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('RELATÓRIO DE BLITZ DE TRÂNSITO', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' });
      
      doc.moveDown(1);

      // Informações da Blitz
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('INFORMAÇÕES DA BLITZ');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Local: ${blitz.local}`)
         .text(`Data: ${blitz.data}`)
         .text(`Hora: ${blitz.hora}`)
         .text(`Status: ${blitz.ativa ? 'ATIVA' : 'ENCERRADA'}`);
      
      if (!blitz.ativa && blitz.dataEncerramento) {
        doc.text(`Data de Encerramento: ${new Date(blitz.dataEncerramento).toLocaleDateString('pt-BR')}`);
      }
      
      doc.moveDown(1);

      // Participantes
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('PARTICIPANTES:');
      
      doc.fontSize(12)
         .font('Helvetica');
      
      blitz.matriculasParticipantes.forEach((matricula, index) => {
        doc.text(`${index + 1}. Matrícula: ${matricula}`);
      });
      
      doc.moveDown(1);

      // Resumo das Abordagens
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text('RESUMO DAS ABORDAGENS');
      
      doc.moveDown(0.5);
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Total de Abordagens: ${abordagens.length}`);
      
      if (abordagens.length > 0) {
        const totalTestesEtilometro = abordagens.filter(a => a.testeEtilometro).length;
        const totalVeiculosRemovidos = abordagens.filter(a => a.veiculoRemovido).length;
        const totalAutuacoes = abordagens.filter(a => a.autuacao).length;
        
        doc.text(`Testes de Etilômetro Realizados: ${totalTestesEtilometro}`)
           .text(`Veículos Removidos: ${totalVeiculosRemovidos}`)
           .text(`Autuações Aplicadas: ${totalAutuacoes}`);
      }
      
      doc.moveDown(1);

      // Detalhes das Abordagens
      if (abordagens.length > 0) {
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('DETALHES DAS ABORDAGENS');
        
        doc.moveDown(0.5);
        
        abordagens.forEach((abordagem, index) => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(`Abordagem ${index + 1}:`);
          
          doc.fontSize(10)
             .font('Helvetica')
             .text(`  Placa: ${abordagem.placaVeiculo}`)
             .text(`  Agente: ${abordagem.matriculaAgente}`)
             .text(`  Data/Hora: ${new Date(abordagem.dataAbordagem).toLocaleString('pt-BR')}`);
          
          if (abordagem.cpfCondutor) {
            doc.text(`  CPF Condutor: ${abordagem.cpfCondutor}`);
          }
          
          if (abordagem.cnhCondutor) {
            doc.text(`  CNH Condutor: ${abordagem.cnhCondutor}`);
          }
          
          doc.text(`  Teste Etilômetro: ${abordagem.testeEtilometro ? 'SIM' : 'NÃO'}`)
             .text(`  Veículo Removido: ${abordagem.veiculoRemovido ? 'SIM' : 'NÃO'}`)
             .text(`  Autuação: ${abordagem.autuacao ? 'SIM' : 'NÃO'}`);
          
          if (abordagem.artigosCodigo && abordagem.artigosCodigo.length > 0) {
            doc.text(`  Artigos Aplicados: ${abordagem.artigosCodigo.join(', ')}`);
          }
          
          if (abordagem.observacoes) {
            doc.text(`  Observações: ${abordagem.observacoes}`);
          }
          
          doc.moveDown(0.5);
        });
      }

      // Rodapé
      doc.moveDown(2);
      doc.fontSize(10)
         .font('Helvetica')
         .text('Este relatório foi gerado automaticamente pelo Sistema de Abordagens de Trânsito', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Função para salvar PDF em arquivo
const savePDFToFile = async (blitz, abordagens, filename) => {
  try {
    const pdfBuffer = await generateBlitzReport(blitz, abordagens);
    const filePath = path.join(__dirname, '..', 'temp', filename);
    
    // Criar diretório temp se não existir
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
  } catch (error) {
    throw new Error(`Erro ao salvar PDF: ${error.message}`);
  }
};

// Função para gerar PDF e retornar buffer
const generatePDFBuffer = async (blitz, abordagens) => {
  try {
    return await generateBlitzReport(blitz, abordagens);
  } catch (error) {
    throw new Error(`Erro ao gerar PDF: ${error.message}`);
  }
};

module.exports = {
  generateBlitzReport,
  savePDFToFile,
  generatePDFBuffer
};
