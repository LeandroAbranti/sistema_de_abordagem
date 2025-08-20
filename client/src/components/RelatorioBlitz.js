import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Car,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Printer,
  BarChart3,
  User,
  Hash
} from 'lucide-react';

const RelatorioBlitz = () => {
  const { blitzId } = useParams();
  const navigate = useNavigate();
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchRelatorio();
  }, [blitzId]);

  const fetchRelatorio = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/blitz/${blitzId}/relatorio`);
      setRelatorio(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar relatório');
      navigate('/blitz');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true);
      const response = await axios.get(`/api/admin/blitz/${blitzId}/relatorio/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-blitz-${blitzId}-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getStatistics = () => {
    if (!relatorio?.abordagens) return {};
    
    const abordagens = relatorio.abordagens;
    return {
      total: abordagens.length,
      comEtilometro: abordagens.filter(a => a.testeEtilometro).length,
      veiculosRemovidos: abordagens.filter(a => a.veiculoRemovido).length,
      autuacoes: abordagens.filter(a => a.autuacao).length,
      porAgente: abordagens.reduce((acc, a) => {
        acc[a.matriculaAgente] = (acc[a.matriculaAgente] || 0) + 1;
        return acc;
      }, {})
    };
  };

  const AbordagemCard = ({ abordagem, index }) => (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">
          Abordagem #{index + 1}
        </h4>
        <span className="text-xs text-gray-500">
          {formatDateTime(abordagem.dataAbordagem)}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div className="flex items-center mb-2">
            <Car className="h-4 w-4 text-blue-500 mr-2" />
            <span className="font-medium">Placa:</span>
            <span className="ml-1">{abordagem.placaVeiculo}</span>
          </div>
          
          {abordagem.cpfCondutor && (
            <div className="flex items-center mb-2">
              <Hash className="h-4 w-4 text-green-500 mr-2" />
              <span className="font-medium">CPF:</span>
              <span className="ml-1">{abordagem.cpfCondutor}</span>
            </div>
          )}
          
          {abordagem.cnhCondutor && (
            <div className="flex items-center mb-2">
              <FileText className="h-4 w-4 text-purple-500 mr-2" />
              <span className="font-medium">CNH:</span>
              <span className="ml-1">{abordagem.cnhCondutor}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <User className="h-4 w-4 text-orange-500 mr-2" />
            <span className="font-medium">Agente:</span>
            <span className="ml-1">{abordagem.matriculaAgente}</span>
          </div>
        </div>
        
        <div>
          <div className="space-y-2">
            <div className={`flex items-center ${abordagem.testeEtilometro ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">Teste Etilômetro</span>
            </div>
            
            <div className={`flex items-center ${abordagem.veiculoRemovido ? 'text-red-600' : 'text-gray-400'}`}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm">Veículo Removido</span>
            </div>
            
            <div className={`flex items-center ${abordagem.autuacao ? 'text-yellow-600' : 'text-gray-400'}`}>
              <FileText className="h-4 w-4 mr-2" />
              <span className="text-sm">Autuação</span>
            </div>
          </div>
        </div>
      </div>
      
      {abordagem.artigosCodigo && abordagem.artigosCodigo.length > 0 && (
        <div className="mt-3">
          <span className="font-medium text-sm text-gray-700">Artigos aplicados:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {abordagem.artigosCodigo.map((artigo, idx) => (
              <span key={idx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                {artigo}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {abordagem.observacoes && (
        <div className="mt-3">
          <span className="font-medium text-sm text-gray-700">Observações:</span>
          <p className="text-sm text-gray-600 mt-1">{abordagem.observacoes}</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!relatorio) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Relatório não encontrado
        </h3>
        <p className="text-gray-500 mb-6">
          O relatório solicitado não foi encontrado.
        </p>
        <button onClick={() => navigate('/blitz')} className="btn-primary">
          Voltar para Blitz
        </button>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/blitz')}
            className="btn-secondary p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Relatório da Blitz
            </h1>
            <p className="text-gray-600 mt-1">
              Dados completos da operação de trânsito
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="btn-primary flex items-center"
          >
            {generatingPDF ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {generatingPDF ? 'Gerando...' : 'Baixar PDF'}
          </button>
        </div>
      </div>

      {/* Informações da Blitz */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Car className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Informações da Blitz</h2>
          <span className={`ml-auto px-3 py-1 text-sm font-medium rounded-full ${
            relatorio.blitz.ativa 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {relatorio.blitz.ativa ? 'Ativa' : 'Encerrada'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Local</p>
              <p className="font-semibold">{relatorio.blitz.local}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Data</p>
              <p className="font-semibold">{relatorio.blitz.data}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Horário</p>
              <p className="font-semibold">{relatorio.blitz.hora}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Participantes</p>
              <p className="font-semibold">{relatorio.blitz.matriculasParticipantes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Agentes participantes:</p>
          <div className="flex flex-wrap gap-2">
            {relatorio.blitz.matriculasParticipantes.map((matricula, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                Matrícula {matricula}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Abordagens</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Testes Etilômetro</p>
              <p className="text-2xl font-bold text-gray-900">{stats.comEtilometro}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Veículos Removidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.veiculosRemovidos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Autuações</p>
              <p className="text-2xl font-bold text-gray-900">{stats.autuacoes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Produtividade por Agente */}
      {Object.keys(stats.porAgente).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Produtividade por Agente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.porAgente).map(([matricula, quantidade]) => (
              <div key={matricula} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Matrícula {matricula}</span>
                  <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                    {quantidade} abordagem{quantidade !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes das Abordagens */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalhes das Abordagens
          </h3>
          <span className="text-sm text-gray-500">
            {relatorio.totalAbordagens} abordagem{relatorio.totalAbordagens !== 1 ? 's' : ''} registrada{relatorio.totalAbordagens !== 1 ? 's' : ''}
          </span>
        </div>
        
        {relatorio.abordagens && relatorio.abordagens.length > 0 ? (
          <div className="space-y-4">
            {relatorio.abordagens.map((abordagem, index) => (
              <AbordagemCard key={abordagem.id} abordagem={abordagem} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma abordagem registrada nesta blitz</p>
          </div>
        )}
      </div>

      {/* Rodapé para impressão */}
      <div className="hidden print:block text-center text-sm text-gray-500 mt-8">
        <p>Relatório gerado em {new Date().toLocaleString('pt-BR')}</p>
        <p>Sistema de Abordagens de Trânsito</p>
      </div>
    </div>
  );
};

export default RelatorioBlitz;
