export default function MainLayout({children}: {children: React.ReactNode}){
    return (
        <div className="p-10 max-w-5xl mx-auto">
             <h1 className="text-2xl font-bold mb-6">
        Finance Tracker
      </h1>
        {children}
        </div>
    )
}