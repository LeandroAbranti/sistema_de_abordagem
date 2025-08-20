import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Car, 
  User, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';

const AbordagemForm = () => {
  const { blitzId } = useParams();
  const navigate = useNavigate();
  const [blitz, setBlitz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    placaVeiculo: '',
    cpfCondutor: '',
    cnhCondutor: '',
    testeEtilometro: false,
    veiculoRemovido: false,
    autuacao: false,
    artigosCodigo: [],
    observacoes: ''
  });
  
  const [novoArtigo, setNovoArtigo] = useState('');

  useEffect(() => {
    fetchBlitzData();
  }, [blitzId]);

  const fetchBlitzData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blitz/${blitzId}`);
      setBlitz(response.data);
      
      // Verificar se o usuário pode participar desta blitz
      const verificacao = await axios.get(`/api/blitz/${blitzId}/verificar-participacao`);
      if (!verificacao.data.podeParticipar) {
        toast.error('Você não tem permissão para participar desta blitz');
        navigate('/blitz');
        return;
      }
    } catch (error) {
      console.error('Erro ao carregar dados da blitz:', error);
      toast.error('Erro ao carregar dados da blitz');
      navigate('/blitz');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPlaca = (value) => {
    // Remove caracteres não alphanumericos
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Formato brasileiro: ABC1234 ou ABC1D23
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    } else {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
    }
  };

  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cleaned.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNH = (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, 11);
  };

  const addArtigo = () => {
    if (novoArtigo.trim() && !formData.artigosCodigo.includes(novoArtigo.trim())) {
      setFormData(prev => ({
        ...prev,
        artigosCodigo: [...prev.artigosCodigo, novoArtigo.trim()]
      }));
      setNovoArtigo('');
    }
  };

  const removeArtigo = (artigo) => {
    setFormData(prev => ({
      ...prev,
      artigosCodigo: prev.artigosCodigo.filter(a => a !== artigo)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.placaVeiculo.trim()) {
      toast.error('Placa do veículo é obrigatória');
      return;
    }
    
    if (!formData.cpfCondutor.trim() && !formData.cnhCondutor.trim()) {
      toast.error('Informe pelo menos o CPF ou CNH do condutor');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        blitzId: parseInt(blitzId),
        placaVeiculo: formData.placaVeiculo.replace(/[^A-Za-z0-9]/g, ''),
        cpfCondutor: formData.cpfCondutor.replace(/\D/g, '') || null,
        cnhCondutor: formData.cnhCondutor.replace(/\D/g, '') || null,
        testeEtilometro: formData.testeEtilometro,
        veiculoRemovido: formData.veiculoRemovido,
        autuacao: formData.autuacao,
        artigosCodigo: formData.artigosCodigo,
        observacoes: formData.observacoes.trim()
      };

      await axios.post('/api/abordagem', payload);
      toast.success('Abordagem registrada com sucesso!');
      
      // Limpar formulário
      setFormData({
        placaVeiculo: '',
        cpfCondutor: '',
        cnhCondutor: '',
        testeEtilometro: false,
        veiculoRemovido: false,
        autuacao: false,
        artigosCodigo: [],
        observacoes: ''
      });
      
      // Perguntar se deseja registrar nova abordagem
      const novaAbordagem = window.confirm('Abordagem registrada! Deseja registrar uma nova abordagem?');
      if (!novaAbordagem) {
        navigate('/blitz');
      }
    } catch (error) {
      console.error('Erro ao registrar abordagem:', error);
      const message = error.response?.data?.error || 'Erro ao registrar abordagem';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!blitz) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Blitz não encontrada
        </h3>
        <p className="text-gray-500 mb-6">
          A blitz solicitada não foi encontrada ou você não tem acesso.
        </p>
        <button onClick={() => navigate('/blitz')} className="btn-primary">
          Voltar para Blitz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/blitz')}
            className="btn-secondary p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Registrar Abordagem
            </h1>
            <p className="text-gray-600 mt-1">
              Blitz: {blitz.local} - {blitz.data} às {blitz.hora}
            </p>
          </div>
        </div>
      </div>

      {/* Informações da Blitz */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <div className="flex items-center mb-2">
          <Car className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-blue-900">Informações da Blitz</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Local:</span> {blitz.local}
          </div>
          <div>
            <span className="font-medium text-blue-800">Data:</span> {blitz.data}
          </div>
          <div>
            <span className="font-medium text-blue-800">Horário:</span> {blitz.hora}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Veículo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Car className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Dados do Veículo</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placa do Veículo *
              </label>
              <input
                type="text"
                required
                value={formData.placaVeiculo}
                onChange={(e) => handleInputChange('placaVeiculo', formatPlaca(e.target.value))}
                className="input-field"
                placeholder="ABC-1234"
                maxLength={8}
              />
            </div>
          </div>
        </div>

        {/* Dados do Condutor */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Dados do Condutor</h3>
            <span className="ml-2 text-sm text-gray-500">(informe pelo menos um)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF do Condutor
              </label>
              <input
                type="text"
                value={formData.cpfCondutor}
                onChange={(e) => handleInputChange('cpfCondutor', formatCPF(e.target.value))}
                className="input-field"
                placeholder="000.000.000-00"
                maxLength={14}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNH do Condutor
              </label>
              <input
                type="text"
                value={formData.cnhCondutor}
                onChange={(e) => handleInputChange('cnhCondutor', formatCNH(e.target.value))}
                className="input-field"
                placeholder="00000000000"
                maxLength={11}
              />
            </div>
          </div>
        </div>

        {/* Procedimentos Realizados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Procedimentos Realizados</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.testeEtilometro}
                onChange={(e) => handleInputChange('testeEtilometro', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Realizou teste do etilômetro
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.veiculoRemovido}
                onChange={(e) => handleInputChange('veiculoRemovido', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Veículo removido/apreendido
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autuacao}
                onChange={(e) => handleInputChange('autuacao', e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                Recebeu autuação
              </span>
            </label>
          </div>
        </div>

        {/* Artigos do CTB */}
        {formData.autuacao && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Artigos do CTB Aplicados</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={novoArtigo}
                  onChange={(e) => setNovoArtigo(e.target.value)}
                  className="flex-1 input-field"
                  placeholder="Ex: Art. 165, Art. 306, etc."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArtigo();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addArtigo}
                  className="btn-secondary px-3"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {formData.artigosCodigo.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.artigosCodigo.map((artigo, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {artigo}
                      <button
                        type="button"
                        onClick={() => removeArtigo(artigo)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Observações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Observações</h3>
          </div>
          
          <textarea
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            className="input-field"
            rows={4}
            placeholder="Descreva detalhes importantes sobre a abordagem, comportamento do condutor, condições do veículo, etc."
          />
        </div>

        {/* Botões */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/blitz')}
            className="btn-secondary flex-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Abordagem
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AbordagemForm;
