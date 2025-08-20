import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Plus, 
  Car, 
  X, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  MapPin,
  StopCircle,
  FileText
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [blitz, setBlitz] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para modais
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBlitzModal, setShowBlitzModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Estados para formulários
  const [novoUsuario, setNovoUsuario] = useState({
    matricula: '',
    nome: '',
    senha: ''
  });
  
  const [novaBlitz, setNovaBlitz] = useState({
    local: '',
    data: '',
    hora: '',
    matriculasParticipantes: []
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'usuarios') {
        const response = await axios.get('/api/admin/usuarios');
        setUsuarios(response.data);
      } else if (activeTab === 'blitz') {
        const response = await axios.get('/api/admin/blitz');
        setBlitz(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/usuarios', novoUsuario);
      toast.success('Usuário criado com sucesso!');
      setShowUserModal(false);
      setNovoUsuario({ matricula: '', nome: '', senha: '' });
      fetchData();
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao criar usuário';
      toast.error(message);
    }
  };

  const handleCreateBlitz = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/blitz', novaBlitz);
      toast.success('Blitz criada com sucesso!');
      setShowBlitzModal(false);
      setNovaBlitz({
        local: '',
        data: '',
        hora: '',
        matriculasParticipantes: []
      });
      fetchData();
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao criar blitz';
      toast.error(message);
    }
  };

  const handleEncerrarBlitz = async (blitzId) => {
    if (!window.confirm('Tem certeza que deseja encerrar esta blitz?')) return;
    
    try {
      await axios.put(`/api/admin/blitz/${blitzId}/encerrar`);
      toast.success('Blitz encerrada com sucesso!');
      fetchData();
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao encerrar blitz';
      toast.error(message);
    }
  };

  const toggleMatriculaParticipante = (matricula) => {
    setNovaBlitz(prev => ({
      ...prev,
      matriculasParticipantes: prev.matriculasParticipantes.includes(matricula)
        ? prev.matriculasParticipantes.filter(m => m !== matricula)
        : [...prev.matriculasParticipantes, matricula]
    }));
  };

  const UserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Criar Novo Usuário</h3>
          <button onClick={() => setShowUserModal(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matrícula
            </label>
            <input
              type="text"
              required
              value={novoUsuario.matricula}
              onChange={(e) => setNovoUsuario(prev => ({ ...prev, matricula: e.target.value }))}
              className="input-field"
              placeholder="Digite a matrícula"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={novoUsuario.nome}
              onChange={(e) => setNovoUsuario(prev => ({ ...prev, nome: e.target.value }))}
              className="input-field"
              placeholder="Digite o nome completo"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={novoUsuario.senha}
              onChange={(e) => setNovoUsuario(prev => ({ ...prev, senha: e.target.value }))}
              className="input-field"
              placeholder="Digite a senha"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Criar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const BlitzModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Criar Nova Blitz</h3>
          <button onClick={() => setShowBlitzModal(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleCreateBlitz} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local da Blitz
            </label>
            <input
              type="text"
              required
              value={novaBlitz.local}
              onChange={(e) => setNovaBlitz(prev => ({ ...prev, local: e.target.value }))}
              className="input-field"
              placeholder="Ex: Avenida Paulista, próximo ao metrô"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={novaBlitz.data}
                onChange={(e) => setNovaBlitz(prev => ({ ...prev, data: e.target.value }))}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horário
              </label>
              <input
                type="time"
                required
                value={novaBlitz.hora}
                onChange={(e) => setNovaBlitz(prev => ({ ...prev, hora: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participantes da Blitz
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
              {usuarios.map((usuario) => (
                <label key={usuario.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={novaBlitz.matriculasParticipantes.includes(usuario.matricula)}
                    onChange={() => toggleMatriculaParticipante(usuario.matricula)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {usuario.nome} (Matrícula: {usuario.matricula})
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowBlitzModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Criar Blitz
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Painel Administrativo
        </h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usuarios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline h-4 w-4 mr-2" />
              Usuários
            </button>
            <button
              onClick={() => setActiveTab('blitz')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blitz'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Car className="inline h-4 w-4 mr-2" />
              Blitz
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab de Usuários */}
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gerenciar Usuários</h2>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuário
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Matrícula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data de Criação
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.nome}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {usuario.matricula}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usuario.isAdmin 
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {usuario.isAdmin ? 'Administrador' : 'Usuário'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usuario.ativo 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {usuario.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(usuario.dataCriacao).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab de Blitz */}
          {activeTab === 'blitz' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gerenciar Blitz</h2>
                <button
                  onClick={() => setShowBlitzModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Blitz
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {blitz.map((b) => (
                    <div key={b.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {b.local}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              b.ativa 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {b.ativa ? 'Ativa' : 'Encerrada'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {b.data}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {b.hora}
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Participantes:</span> {b.matriculasParticipantes.join(', ')}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => window.open(`/relatorio/${b.id}`, '_blank')}
                            className="btn-secondary text-sm py-1 px-2"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          
                          {b.ativa && (
                            <button
                              onClick={() => handleEncerrarBlitz(b.id)}
                              className="btn-danger text-sm py-1 px-2"
                            >
                              <StopCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {showUserModal && <UserModal />}
      {showBlitzModal && <BlitzModal />}
    </div>
  );
};

export default AdminPanel;
