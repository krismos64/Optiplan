import { Calendar, Clock, Users, FileSpreadsheet } from "lucide-react";

const Home = () => {
  return (
    <main className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-bold text-indigo-900 mb-6">
          OptiPlan
        </h1>
        <p className="text-xl md:text-2xl text-indigo-700 italic mb-8">
          "Optimisez votre temps, facilitez vos plannings !"
        </p>
        <a
          href="/register"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transform transition hover:scale-105"
        >
          Commencer
        </a>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Calendar className="w-12 h-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Planification Intuitive
          </h3>
          <p className="text-gray-600">Gérez vos plannings en quelques clics</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Clock className="w-12 h-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Gain de Temps</h3>
          <p className="text-gray-600">Automatisez vos tâches répétitives</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Users className="w-12 h-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Gestion d'Équipe</h3>
          <p className="text-gray-600">Coordonnez facilement vos équipes</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <FileSpreadsheet className="w-12 h-12 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Export PDF</h3>
          <p className="text-gray-600">Générez des rapports professionnels</p>
        </div>
      </section>
    </main>
  );
};

export default Home;
