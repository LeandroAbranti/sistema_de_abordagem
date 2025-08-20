import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Car, 
  Users, 
  FileText, 
  Plus, 
  Eye, 
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Shield
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalBlitz: 0,
    blitzAtivas: 0,
    totalAbordagens: 0,
    minhasAbordagens: 0
  });
  const [recentBlitz, setRecentBlitz] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const [blitzResponse, abordagensResponse] = await Promise.all([
        axios.get('/api/blitz'),
        axios.get('/api/abordagem/minhas/abordagens')
      ]);

      const blitz = blitzResponse.data;
      const abordagens = abordagensResponse.data.abordagens;

      setStats({
        totalBlitz: blitz.length,
        blitzAtivas: blitz.filter(b => b.ativa).length,
        totalAbordagens: abordagens.length,
        minhasAbordagens: abordagens.length
      });

      // Blitz mais recentes
      const recent = blitz
        .filter(b => b.matriculasParticipantes.includes(user.matricula))
        .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
        .slice(0, 5);

      setRecentBlitz(recent);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, link }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 ${link ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const BlitzCard = ({ blitz }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{blitz.local}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          blitz.ativa 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {blitz.ativa ? 'Ativa' : 'Encerrada'}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          {blitz.data}
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          {blitz.hora}
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2" />
          {blitz.local}
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <Link
          to={`/abordagem/${blitz.id}`}
          className="flex-1 btn-primary text-center text-sm py-2"
        >
          Registrar Abordagem
        </Link>
        <Link
          to={`/relatorio/${blitz.id}`}
          className="btn-secondary text-sm py-2 px-3"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo, {user?.nome}!
          </h1>
          <p className="text-gray-600 mt-2">
            Acompanhe suas atividades e gerencie suas abordagens
          </p>
        </div>
        
        {isAdmin() && (
          <Link to="/admin" className="btn-primary flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Painel Administrativo
          </Link>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Blitz"
          value={stats.totalBlitz}
          icon={Car}
          color="bg-blue-500"
        />
        <StatCard
          title="Blitz Ativas"
          value={stats.blitzAtivas}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Total de Abordagens"
          value={stats.totalAbordagens}
          icon={FileText}
          color="bg-purple-500"
        />
        <StatCard
          title="Minhas Abordagens"
          value={stats.minhasAbordagens}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/blitz"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
          >
            <Car className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Ver Blitz</h3>
              <p className="text-sm text-gray-600">Visualizar todas as blitz</p>
            </div>
          </Link>
          
          {isAdmin() && (
            <Link
              to="/admin"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
            >
              <Plus className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Criar Blitz</h3>
                <p className="text-sm text-gray-600">Nova operação de trânsito</p>
              </div>
            </Link>
          )}
          
          <Link
            to="/abordagem"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200"
          >
            <FileText className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Nova Abordagem</h3>
              <p className="text-sm text-gray-600">Registrar abordagem</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Blitz Recentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Blitz Recentes
          </h2>
          <Link to="/blitz" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver todas
          </Link>
        </div>
        
        {recentBlitz.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBlitz.map((blitz) => (
              <BlitzCard key={blitz.id} blitz={blitz} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>Nenhuma blitz encontrada</p>
            <p className="text-sm">Você será notificado quando novas blitz forem criadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
